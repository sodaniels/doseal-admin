$(document).ready(function () {
	$("#confirmationButton").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		let code = "";
		$(".verification-inputs input").each(function () {
			code += $(this).val();
		});

		var phoneNumber = localStorage.getItem("phoneNumber");

		const userData = {
			code: code,
			phoneNumber: phoneNumber,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Authenticating...");

		jQuery.ajax({
			url: "../../gen4/confirm-code",
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
				if (result.code === 400) {
					Swal.fire({
						title: "Invalid Code !!",
						text: "The code you entered is not valid. Please check for the right code.",
						icon: "warning",
					});
					document.getElementById("processSignupForm").reset();
					return false;
				}

				if (result.code === 401) {
					Swal.fire({
						title: "Code expired !!",
						text: "The code has expired. Please try signing in again.",
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
					console.log(JSON.stringify(result));
					const redirectUrl = localStorage.getItem("redirectUrl");

					localStorage.removeItem("phoneNumber");
					localStorage.removeItem("redirectUrl");

					window.location.href = `${redirectUrl}?code=${result.authCode}`;
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

	const submitButton = document.getElementById("confirmationButton");
	const inputs = document.querySelectorAll(".verification-inputs input");

	// Function to check if total input length is 6
	function checkInputLength() {
		const totalLength = Array.from(inputs).reduce(
			(acc, input) => acc + input.value.length,
			0
		);

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
