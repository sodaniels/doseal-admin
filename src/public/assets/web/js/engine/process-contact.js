$(document).ready(function () {
	$("#procesContactForm").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var fullName = $("#fullName").val();
		var email = $("#email").val();
		var website = $("#website").val();
		var message = $("#message").val();

		let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		let captchaResponse = grecaptcha.getResponse();

		if (fullName === "" || fullName === undefined) {
			Swal.fire({
				title: "Enter Full Name",
				text: "Please enter your full name",
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

		if (message === "" || message === undefined) {
			Swal.fire({
				title: "Enter Message",
				text: "Please enter your message",
				icon: "warning",
			});
			return false;
		}

		const userData = {
			fullName: fullName,
			email: email,
			website: website,
			message: message,
			"g-recaptcha-response": captchaResponse,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../contact-us",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Send');

				if (result.errors) {
					const errorMessages = displayErrors(result.errors);
					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
					});
					return false;
				}

				if (result.code === 401) {
					$("#loadingOverlay").css("display", "none");
					Swal.fire({
						title: "Security Check !!",
						text: "Please click the 'I'm not a robot checkbox' to proceed",
						icon: "warning",
					});
					return false;
				}

				if (result.code === 200) {
					Swal.fire({
						title: "Message Received !!",
						text: "We recieved your message successfully.",
						icon: "success",
					});

					document.getElementById("contact-form").reset(); // Reset the form
					grecaptcha.reset(); // Reset the reCAPTCHA
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
