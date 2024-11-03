$(document).ready(function () {
	$("#listServiceButton").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var phoneNumber = $("#phoneNumber").val();

		if (phoneNumber === "" || phoneNumber === undefined) {
			Swal.fire({
				title: "Enter Phone Number",
				text: "Please enter a phone number",
				icon: "warning",
			});
			return false;
		}

		const userData = {
			phoneNumber: phoneNumber,
			type: "ECG"
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../search-account",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				localStorage.setItem("phoneNumber", result.phoneNumber);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');
				
				if (result.errors) {
					const errorMessages = displayErrors(result.errors);
					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
					});
					return false;
				}

				if (result.code === 200) {
					$("#step1").hide();
					$("#step2").show();
					$("#step3").hide();

					const meterOptions = result.data;
					const $container = $("#meterOptionsContainer");
					// Clear any existing content in the container
					$container.empty();
					// Loop through each option in result.data and append it to the container
					$.each(meterOptions, function (index, option) {
						localStorage.setItem("meterId", option.Value);
						localStorage.setItem("meterName", option.Display);
						localStorage.setItem("amount", option.Amount);

						const radioItem = `
							<div class="radio-item">
								<input type="radio" id="${option.Value}" name="meterOption" value="${option.Value}" class="form-control style-border" />
								<label for="${option.Value}">
								<strong>${option.Display}</strong><br />
								<span class="subtitle">${option.Value}</span>
								</label>
							</div>
							`;
						$container.append(radioItem);
					});
				}else if (result.code === 401) {
					Swal.fire({
						title: "Security Check !!",
						text: "Please click the 'I'm not a robot checkbox' to proceed",
						icon: "warning",
					});
					return false;
				} else if (result.code === 402) {
					Swal.fire({
						title: "Account Exist!",
						text: result.message,
						icon: "warning",
					});
					return false;
				} else if (result.code === 400) {
					Swal.fire({
						title: "Not Found!",
						text: "We did not find any information for this number",
						icon: "warning",
					});
					return false;
				} else {
					$("#loadingOverlay").css("display", "none");
					Swal.fire({
						title: "An error occurred !!",
						text: "An error occurred. please try again",
						icon: "warning",
					});
					return false;
				}
			},
		});
	});

	$("#submitMeterID_number").click(function (e) {
		const selectedOption = $("input[name='meterOption']:checked").val();

		if (!selectedOption) {
			// Show a warning message if no option is selected
			Swal.fire({
				title: "No Option Selected",
				text: "Please select an account to proceed",
				icon: "warning",
			});
			return false;
		}
		const phoneNumber = localStorage.getItem("phoneNumber");
		const meterId = localStorage.getItem("meterId");
		const meterName = localStorage.getItem("meterName");
		const amount = localStorage.getItem("amount");

		$("#step1").hide();
		$("#step2").hide();
		$("#step3").show();

		$("#accountPhoneNumber").val(phoneNumber);
		$("#meterName").val(meterName);
		$("#meterId").val(meterId);
		$("#amount").val(amount);

		$("#amount").focus();
	});

	$("#confirmPayment").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var phoneNumber = localStorage.getItem("phoneNumber");
		var meterName = localStorage.getItem("meterName");
		var meterId = localStorage.getItem("meterId");
		const amount = $("#amount").val();

		const userData = {
			phoneNumber: phoneNumber,
			meterName: meterName,
			meterId: meterId,
			amount: amount,
			type: "ECG",
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../transaction-init",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Next');

				if (result.errors) {
					const errorMessages = displayErrors(result.errors);
					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
					});
					return false;
				}

				if (result.code === 200) {
					const res = result.data;

					const meterName = $("#meterName").val();
					localStorage.setItem("type", userData.type);

					// Populate the modal with the form values
					$("#confirmServiceType").text(userData.type);
					$("#confirmPhoneNumber").text(res.phoneNumber);
					$("#confirmMeterName").text(meterName);
					$("#confirmMeterId").text(res.meterId);
					$("#confirmAmount").text(Number(res.amount).toFixed(2));
					$("#confirmFee").text(Number(res.fee).toFixed(2));
					$("#confirmTotalAmount").text(Number(res.totalAmount).toFixed(2));

					// Show the modal
					$("#transactionConfirmModal").modal("show");
				} else {
					$("#loadingOverlay").css("display", "none");
					Swal.fire({
						title: "An error occurred !!",
						text: "An error occurred. please try again",
						icon: "warning",
					});
					return false;
				}
			},
		});
	});

	$("#resetStep1").on("click", function () {
		document.getElementById("step1Form").reset(); // Reset the form
	});
	$("#resetStep2").on("click", function () {
		$("#step1").show();
		$("#step2").hide();
		$("#step3").hide();
	});
	$("#resetStep3").on("click", function () {
		$("#step1").hide();
		$("#step2").show();
		$("#step3").hide();
	});

	$("#closeConfirmButton").on("click", function () {
		$("#transactionConfirmModal").modal("hide");
	});

	// Action for the Confirm button in the modal
	$("#confirmTransactionBtn").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var phoneNumber = localStorage.getItem("phoneNumber");
		var meterId = localStorage.getItem("meterId");
		var type = localStorage.getItem("type");
		const amount = $("#amount").val();

		const userData = {
			phoneNumber: phoneNumber,
			meterId: meterId,
			amount: amount,
			type: type,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../transaction-exec",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

				if (result.errors) {
					const errorMessages = displayErrors(result.errors);
					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
					});
					return false;
				}

				if (result.code === 200) {
					$("#step1").show();
					$("#step2").hide();
					$("#step3").hide();
					$("#transactionConfirmModal").modal("hide");
					document.getElementById("step1Form").reset();
					window.open(result.url, "_blank");
				} else {
					$("#loadingOverlay").css("display", "none");
					Swal.fire({
						title: "An error occurred !!",
						text: "An error occurred. please try again",
						icon: "warning",
					});
					return false;
				}
			},
		});
	});
});

function displayErrors(errors) {
	// Collect error messages
	var errorMessages = errors
		.map(function (error) {
			return error.message;
		})
		.join("\n");
	return errorMessages;
}
