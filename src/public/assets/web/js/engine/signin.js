$(document).ready(function () {
	$("#procesSiginUserForm").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var email = $("#email").val();
		var password = $("#password").val();

		let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		let captchaResponse = grecaptcha.getResponse();

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

		if (captchaResponse === "" || captchaResponse === undefined) {
			Swal.fire({
				title: "Missing Security Response",
				text: "Please select the checkbox to indicate you are a human",
				icon: "warning",
			});
			return false;
		}

		const userData = {
			email: email,
			password: password,
			"g-recaptcha-response": captchaResponse,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Authenticating...");

		jQuery.ajax({
			url: "../../initiate-signin",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

				if (result.code === 409) {
					const errorMessages = errors
						.map((error) => `${error.field}: ${error.message}`)
						.join("\n");

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
