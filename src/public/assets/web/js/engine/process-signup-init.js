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
		var email = $("#email").val();
		var password = $("#password").val();
		var confirmPassword = $("#confirmPassword").val();

		let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		let captchaResponse = grecaptcha.getResponse();

		if (phoneNumber === "" || phoneNumber === undefined) {
			Swal.fire({
				title: "Enter Phone Number",
				text: "Please enter a phone number",
				icon: "warning",
			});
			return false;
		}

		if (email === "" || email === undefined) {
			Swal.fire({
				title: "Enter Email",
				text: "Please enter your email address",
				icon: "warning",
			});
			return false;
		}

		if (email && !emailPattern.test(email)) {
			Swal.fire({
				title: "Invlid Email Address",
				text: "The email address you entered is not valid",
				icon: "warning",
			});
			return false;
		}

		if (password === "" || password === undefined) {
			Swal.fire({
				title: "Enter Password",
				text: "Please enter your password",
				icon: "warning",
			});
			return false;
		}

		if (password.length < 8) {
			Swal.fire({
				title: "Password is too weak",
				text: "The password must be at least 8 characters",
				icon: "warning",
			});
			return false;
		}

		if (password !== confirmPassword) {
			Swal.fire({
				title: "Password Mismatch",
				text: "The password and the confirm password do not match",
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

		const userData = {
			phoneNumber: phoneNumber,
			email: email,
			password: password,
			confirmPassword: confirmPassword,
			"g-recaptcha-response": captchaResponse,
		};

		localStorage.setItem("phoneNumber", phoneNumber);
		localStorage.setItem("email", email);

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../initiate-signup",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

				if (result.code === 409) {
					const errorMessages = displayErrors(result.errors);

					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
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

				if (result.code === 402) {
					Swal.fire({
						title: "Account Exist!",
						text: result.message,
						icon: "warning",
					});
					return false;
				}

				if (result.code === 200) {
					window.location.href = "verify-account";
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

function displayErrors(errors) {
	// Collect error messages
	var errorMessages = errors
		.map(function (error) {
			return error.message;
		})
		.join("\n");

	return errorMessages;
}
