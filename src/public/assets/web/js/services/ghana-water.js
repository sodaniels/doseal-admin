$(document).ready(function () {
	$("#listServiceButton").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var accountNumber = $("#accountNumber").val();
		var phoneNumber = $("#phoneNumber").val();

		if (accountNumber === "" || accountNumber === undefined) {
			Swal.fire({
				title: "Enter Account Number",
				text: "Please enter the account number",
				icon: "warning",
			});
			return false;
		}

		const userData = {
			phoneNumber: phoneNumber,
			accountNumber: accountNumber,
			type: "GhanaWater",
		};

		localStorage.setItem("type", userData.type);

		localStorage.setItem("accountNumber", accountNumber);
		localStorage.setItem("phoneNumber", phoneNumber);

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../search-ghana-water",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

				if (result.code === 200) {
					$("#step1").hide();
					$("#step2").show();
					$("#step3").hide();

					const resultObject = result.data;
					const $container = $("#meterOptionsContainer");
					// Clear any existing content in the container
					$container.empty();
					// Loop through each option in result.data and append it to the container

					const type = localStorage.getItem("type");

					const inputData = {
						accountName: resultObject[0].Value,
						amount: resultObject[1].Value,
						accountNumber: localStorage.getItem("accountNumber"),
						sessionId: resultObject[2].Value,
						type: type,
					};

					localStorage.setItem("inputData", JSON.stringify(inputData));

					console.log("inputData: " + JSON.stringify(inputData));

					const radioItem = `
					  <div class="radio-item">
						  <input type="radio" id="${inputData.accountNumber}" name="meterOption" value="${inputData.accountNumber}" class="form-control style-border" />
						  <label for="${inputData.accountNumber}">
						  <strong>${inputData.accountName}</strong><br />
						  <strong>${inputData.accountNumber}</strong><br />
						  <span class="subtitle">GHS ${inputData.amount}</span>
						  </label>
					  </div>
					  `;
					$container.append(radioItem);
				} else if (result.code === 409) {
					const errorMessages = errors
						.map((error) => `${error.field}: ${error.message}`)
						.join("\n");

					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
					});
					return false;
				} else if (result.code === 401) {
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
		const inputData = JSON.parse(localStorage.getItem("inputData"));

		$("#step1").hide();
		$("#step2").hide();
		$("#step3").show();

		$("#_phoneNumber").val(localStorage.getItem("phoneNumber"));
		$("#_accountNumber").val(inputData.accountNumber);
		$("#accountName").val(inputData.accountName);
		$("#amount").val(inputData.amount);
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

		const inputData = JSON.parse(localStorage.getItem("inputData"));

		const phoneNumber = localStorage.getItem("phoneNumber");
		

		var amount = $("#amount").val();

		const userData = {
			phoneNumber: phoneNumber,
			accountName: inputData.accountName,
			accountNumber: inputData.accountNumber,
			sessionId: inputData.sessionId,
			amount: amount,
			type: "GhanaWater",
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

				if (result.code === 200) {
					const res = result.data;

					console.log("res: " + JSON.stringify(res));

					localStorage.setItem("type", userData.type);

					// Populate the modal with the form values
					$("#confirmPhoneNumber").text(localStorage.getItem("phoneNumber"));
					$("#confirmServiceType").text(userData.type);
					$("#confirmMeterName").text(inputData.accountName);
					$("#confirmMeterId").text(inputData.accountNumber);
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

		const inputData = JSON.parse(localStorage.getItem("inputData"));

		var type = localStorage.getItem("type");
		const amount = $("#amount").val();

		const phoneNumber = localStorage.getItem("phoneNumber");

		const userData = {
			phoneNumber: phoneNumber,
			accountName: inputData.accountName,
			accountNumber: inputData.accountNumber,
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

				if (result.code === 200) {
					$("#step1").show();
					$("#step2").hide();
					$("#step3").hide();
					$("#transactionConfirmModal").modal("hide");
					document.getElementById("step1Form").reset();
					window.open(result.url, "_blank");
				} else if (result.code === 400) {
					Swal.fire({
						title: "Something went wrong!",
						text: "Please check your account number and try again",
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
});
