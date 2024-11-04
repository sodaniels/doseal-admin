$(document).ready(function () {
	$("#loginButton").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var countryCode = $("#countryCode").val();
		var phoneNumber = $("#phoneNumber").val();

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

		if (phoneNumber.length > 10) {
			Swal.fire({
				title: "Check phone number",
				text: "The phone number must not include the country code",
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
			countryCode: countryCode,
			phoneNumber: phoneNumber,
			"g-recaptcha-response": captchaResponse,
		};

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
					window.location.href = "../../auth/confirm-code";
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

	const submitButton = document.getElementById("confirmationButton");
	const inputs = document.querySelectorAll(".verification-inputs input");

	// Function to check if total input length is 6
	function checkInputLength() {
		const totalLength = Array.from(inputs).reduce((acc, input) => acc + input.value.length, 0);
		
		if (totalLength === 6) {
			submitButton.disabled = false; // Enable button
			submitButton.classList.add("btn-enabled"); // Add btn-enabled class
		} else {
			submitButton.disabled = true; // Disable button
			submitButton.classList.remove("btn-enabled"); // Remove btn-enabled class
		}
	}

	inputs.forEach((input, index) => {
		input.addEventListener("input", () => {
			// Move to the next input if this one has a character
			if (input.value.length === 1 && index < inputs.length - 1) {
				inputs[index + 1].focus();
			}
			checkInputLength(); // Check input length on every input event
		});

		input.addEventListener("keydown", (e) => {
			// Handle backspace to move back to the previous input
			if (e.key === "Backspace" && input.value === "" && index > 0) {
				inputs[index - 1].focus();
			}
			checkInputLength(); // Check input length on every keydown event
		});
	});

	// Initialize button state on page load
	checkInputLength();
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

if (phoneNumber.length >= 9) {
	$("#loginButton")
		.prop("disabled", false) // Enable the button
		.addClass("btn-enabled"); // Add enabled class
} else {
	$("#loginButton")
		.prop("disabled", true) // Disable the button
		.removeClass("btn-enabled"); // Remove enabled class
}
