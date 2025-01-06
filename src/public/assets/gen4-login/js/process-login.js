$(document).ready(function () {
	$("#loginButton").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var env = $("#env").val();
		var countryCode = $("#countryCode").val();
		var phoneNumber = $("#phoneNumber").val();
		var referralCode = $("#referralCode").val();

		// const token = $('[name="cf-turnstile-response"]').val();

		let captchaResponse = grecaptcha.getResponse();

		if (countryCode === "" || countryCode === undefined) {
			Swal.fire({
				title: "Select Country",
				text: "Please select a country",
				icon: "warning",
			});
			return false;
		}

		if (phoneNumber === "" || phoneNumber === undefined) {
			Swal.fire({
				title: "Enter phone number",
				text: "Please enter the phone number",
				icon: "warning",
			});
			return false;
		}

		if (captchaResponse === "" || captchaResponse === undefined) {
			Swal.fire({
				title: "Missing Security Response",
				text: "Please select the checkbox to indicate you are a human",
				icon: "warning",
			});
			return false;
		}


		// if (phoneNumber.length > 10) {
		// 	Swal.fire({
		// 		title: "Check phone number",
		// 		text: "The phone number must not include the country code",
		// 		icon: "warning",
		// 	});
		// 	return false;
		// }

	
		// if (!token && env !== "development") {
		// 	Swal.fire({
		// 		title: "Missing Security Response",
		// 		text: "Please complete the CAPTCHA",
		// 		icon: "warning",
		// 	});
		// 	return false;
		// }

	

		var urlParams = new URLSearchParams(window.location.search);
		var redirectUrl = urlParams.get('redirectUrl');

		const userData = {
			countryCode: countryCode,
			phoneNumber: phoneNumber,
			redirectUrl: redirectUrl,
			"g-recaptcha-response": captchaResponse,
			// token: token,
		};

		localStorage.setItem("redirectUrl", redirectUrl);
		localStorage.setItem("referralCode", referralCode);

		console.log(userData);

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Authenticating...");

		jQuery.ajax({
			url: "../../authentate/login",
			method: "post",
			data: userData,

			success: function (result) {
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
                if (result.code === 402) {
					Swal.fire({
						title: "Check phone number",
						text: result.message,
						icon: "warning",
					});
					return false;
				}

				if (result.code === 401) {
					Swal.fire({
						title: "Security Check !!",
						text: "Please click the 'I'm not a robot checkbox' to proceed",
						icon: "warning",
					});
					return false;
				}
				if (result.code === 403) {
					Swal.fire({
						title: "Invalid Credential !!",
						text: "Invlide email and password combination",
						icon: "warning",
					});
					return false;
				}
				if (result.code === 500) {
					Swal.fire({
						title: "An error occurred",
						text: "An error occurred. Please try again",
						icon: "warning",
					});
					return false;
				}

				if (result.code === 200) {
					localStorage.setItem("phoneNumber", result.phoneNumber);
					window.location.href = "../../gen4/confirm-code";
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

	$("#phoneNumber").on("input", function () {
		// Get the current value of the input
		const phoneNumber = $(this).val().trim();

		if (phoneNumber.length >= 9) {
			$("#loginButton")
				.prop("disabled", false) // Enable the button
				.addClass("btn-enabled"); // Add enabled class
		} else {
			$("#loginButton")
				.prop("disabled", true) // Disable the button
				.removeClass("btn-enabled"); // Remove enabled class
		}
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
