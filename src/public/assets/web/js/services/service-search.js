$(document).ready(function () {
	$("#signUpBtn").click(function (e) {
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
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../search-ecg-meter",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				localStorage.setItem("phoneNumber", result.phoneNumber);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

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
		const phoneNumber = localStorage.getItem("phoneNumber");
		const meterId = localStorage.getItem("meterId");
		const meterName = localStorage.getItem("meterName");
		const amount = localStorage.getItem("amount");

		$("#step1").hide();
		$("#step2").hide();
		$("#step3").show();

		$("#accountPhoneNumber").val(phoneNumber);
		$("#meterName").val(meterId);
		$("#meterId").val(meterName);
		$("#amount").val(amount);

		$("#amount").focus();
	});
});
