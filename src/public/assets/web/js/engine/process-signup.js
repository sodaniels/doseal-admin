$(document).ready(function () {
	$("#procesContactForm").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var firstName = $("#firstName").val();
		var lastName = $("#lastName").val();
		var phoneNumber = $("#phoneNumber").val();
		var email = $("#email").val();
		var idType = $("#idType").val();
		var idNumber = $("#idNumber").val();
		var idExpiry = $("#idExpiry").val();

		let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		let captchaResponse = grecaptcha.getResponse();

		let inputDate = new Date(idExpiry);
		let currentDate = new Date();

		// Set the time to midnight to only compare dates
		currentDate.setHours(0, 0, 0, 0);

		if (firstName === "" || firstName === undefined) {
			Swal.fire({
				title: "Enter First Name",
				text: "Please enter your first name",
				icon: "warning",
			});
			return false;
		}

		if (lastName === "" || lastName === undefined) {
			Swal.fire({
				title: "Enter Last Name",
				text: "Please enter your last name",
				icon: "warning",
			});
			return false;
		}

		if (phoneNumber === "" || phoneNumber === undefined) {
			Swal.fire({
				title: "Enter Phone Number",
				text: "Please enter your phone number",
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

		if (idType === "" || idType === undefined) {
			Swal.fire({
				title: "Select ID Type",
				text: "Please select your ID Type",
				icon: "warning",
			});
			return false;
		}

		if (idNumber === "" || idNumber === undefined) {
			Swal.fire({
				title: "Enter ID Number",
				text: "Please Enter the ID Number",
				icon: "warning",
			});
			return false;
		}

		if (idExpiry === "" || idExpiry === undefined) {
			Swal.fire({
				title: "Select ID Expiry Date",
				text: "Please select your ID Expiry Date",
				icon: "warning",
			});
			return false;
		}

		if (inputDate < currentDate) {
			Swal.fire({
				title: "Invalid Date Selected",
				text: "The date you entered is in the past. If the card has expired please use a different one.",
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
			firstName: firstName,
			lastName: lastName,
			phoneNumber: phoneNumber,
			email: email,
			idType: idType,
			idNumber: idNumber,
			idExpiry: idExpiry,
			"g-recaptcha-response": captchaResponse,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../signup",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Send');

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
