$(document).ready(function () {
	$("#submitForRateButton").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var recipient_empty = $("#recipient_empty").val();

		var recipient_id = $("#recipient_id").val();
		var billing_id = $("#billing_id").val();
		var billing_empty = $("#billing_empty").val();
		var sender_id = $("#sender_id").val();
		var sendAmount = $("#sendAmount").val();
		var pin = $("#pin").val();

		if (
			(recipient_id === "" || recipient_id === undefined) &&
			(recipient_empty === "" || recipient_empty === undefined)
		) {
			Swal.fire({
				title: "Selected Beneficiary",
				text: "Please select the beneficiary",
				icon: "warning",
			});
			return false;
		}

		if (
			(billing_id === "" || billing_id === undefined) &&
			(billing_empty === "" || billing_empty === undefined)
		) {
			Swal.fire({
				title: "Selected Billing Information",
				text: "Please select the billing information",
				icon: "warning",
			});
			return false;
		}

		if (sender_id === "") {
			Swal.fire({
				title: "Selected Sender Information",
				text: "Please select the senders information",
				icon: "warning",
			});
			return false;
		}

		if (sendAmount === "") {
			Swal.fire({
				title: "Enter Amount",
				text: "Please enter the amount",
				icon: "warning",
			});
			return false;
		}

		if (pin === "") {
			Swal.fire({
				title: "Enter PIN",
				text: "Please enter your PIN",
				icon: "warning",
			});
			return false;
		}

		if (pin.length < 4) {
			Swal.fire({
				title: "Invalid PIN",
				text: "The PIN must be at least 4 characters",
				icon: "warning",
			});
			return false;
		}
		if (pin.length > 12) {
			Swal.fire({
				title: "Invalid PIN",
				text: "The PIN must be at least 12 characters",
				icon: "warning",
			});
			return false;
		}

		const userData = {
			recipient_id: recipient_id,
			billing_id: billing_id,
			sender_id: sender_id,
			sendAmount: sendAmount,
			pin: pin,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "send-money-check-rate",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Send');

				if (result.code === 200) {
					$("#loadingOverlay").css("display", "none");
					$("#submitButton").show();
					$("#submitForRateButton").hide();

					$("#rateInput")
						.prop("disabled", false)
						.val(result.rate)
						.prop("disabled", true); // Set the rate
					$("#rate").show(); // Show the rate field

					Swal.fire({
						title: "Confirmation Transaction",
						html:
							`<div style="text-align: left;">` +
							`<p><strong>Recipient Name:</strong><span> ` +
							result.recipient.verifiedName +
							`</span></p>` +
							`<p><strong>Sender Name:</strong><span> ` +
							result.sender.fullName +
							`</span></p>` +
							`<p><strong>Send Amount:</strong><span> ` +
							result.senderCurrency +
							` ` +
							result.amountDetails.sendAmount +
							`</span></p>` +
							`<p><strong>Fee:</strong><span> ` +
							result.senderCurrency +
							` ` +
							result.amountDetails.fee +
							`</span></p>` +
							`<p><strong>Total Send Amount:</strong><span> ` +
							result.senderCurrency +
							` ` +
							result.amountDetails.totalSendAmount +
							`</span></p>` +
							`<p><strong>Total Receive Amount:</strong><span> ` +
							result.recipientCurrency +
							` ` +
							result.amountDetails.totalReceiveAmount +
							`</span></p>` +
							`<p><strong>Current Rate:</strong><span> ` +
							result.rate +
							`</span></p>` +
							`</div>`,
						icon: "success",
						confirmButtonText: "Confirm",
						showCancelButton: true,
						cancelButtonText: "Cancel",
					}).then((status) => {
						if (status.isConfirmed) {
							$("#loadingOverlay").css("display", "flex");
							console.log("Transaction confirmed");
							jQuery.ajax({
								url: "send-money",
								method: "post",
								data: userData,

								success: function (res) {
									console.log(result);

									if (res.code === 401) {
										$("#loadingOverlay").css("display", "none");
										$("#submitForRateButton").show();
										$("#rate").show();
										Swal.fire({
											title: "Invalid PIN",
											text: res.message,
											icon: "warning",
										});
										return false;
									}

									if (res.code === 406) {
										$("#loadingOverlay").css("display", "none");
										$("#submitForRateButton").show();
										$("#rate").show();
										Swal.fire({
											title: "Account Locked",
											text: res.message,
											icon: "warning",
										});
										return false;
									}
									if (res.code === 408) {
										$("#loadingOverlay").css("display", "none");
										$("#submitForRateButton").show();
										$("#rate").show();
										Swal.fire({
											title: "Low Blance",
											text: res.message,
											icon: "warning",
										});
										return false;
									}
									if (res.code === 409) {
										$("#loadingOverlay").css("display", "none");
										$("#submitForRateButton").show();
										$("#rate").show();
										Swal.fire({
											title: "Approval Required !!",
											text: res.message,
											icon: "warning",
										});
										return false;
									}
									if (res.code === 400) {
										$("#loadingOverlay").css("display", "none");
										$("#submitForRateButton").show();
										$("#rate").show();
										Swal.fire({
											title: "Transaction Failed",
											text: "The transaction could not be completed. Please try again.",
											icon: "warning",
										});

										return false;
									}

									if (res.code === 411) {
										$("#loadingOverlay").css("display", "none");
										$("#submitForRateButton").show();
										$("#rate").show();
										Swal.fire({
											title: "Sent for processing",
											text: "The transaction has been sent for processing. We'll notify you when it is completed.",
											icon: "success",
										});
										setTimeout(function () {
											window.location.href = "/ng/send-money";
										}, 3000);
									}
								},
							});
						} else if (status.isDismissed) {
							console.log("Transaction cancelled");
							$button.prop("disabled", false);
							$button.html('<i class="la la-send"></i> Next');
							$("#submitForRateButton").show();
							$("#rate").hide();
						}
					});
				} else {
					if (result.code === 406) {
						$("#loadingOverlay").css("display", "none");
						Swal.fire({
							title: "An error occurred !!",
							text: "An error occurred. please try again",
							icon: "warning",
						});
						return false;
					}
				}
			},
		});
	});
});
