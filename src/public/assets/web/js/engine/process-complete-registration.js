$(document).ready(function () {
	$("#procesContactForm").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get("token");

		var $button = $(this);

		var firstName = $("#firstName").val();
		var lastName = $("#lastName").val();
		var idType = $("#idType").val();
		var idNumber = $("#idNumber").val();
		var idExpiry = $("#idExpiry").val();

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

		const userData = {
			firstName: firstName,
			lastName: lastName,
			idType: idType,
			idNumber: idNumber,
			idExpiry: idExpiry,
			token: token,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../complete-registration",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> SUBMIT');

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
					localStorage.removeItem("phoneNumber");
					localStorage.removeItem("email");

					Swal.fire({
						title: "Your account is created successfully",
						text: "You can now proceed to use our services.",
						icon: "success",
					});
					setTimeout(function () {
						window.location.href = "pay-bills";
					}, 3000);
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
