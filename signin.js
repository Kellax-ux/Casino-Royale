document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signinForm")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const togglePasswordButton = document.getElementById("togglePassword")
  const signinButton = document.getElementById("signinButton")
  //const formMessage = document.getElementById("form-message")

  // Toggle password visibility
  togglePasswordButton.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    // Toggle eye icon
    const eyeIcon = this.querySelector("svg")
    if (type === "password") {
      eyeIcon.innerHTML =
        '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>'
    } else {
      eyeIcon.innerHTML =
        '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line>'
    }
  })

  // Form validation
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (validateForm()) {
        signinButton.disabled = true;
        signinButton.textContent = "Signing in...";

        const formData = new FormData(form);

        fetch("/signin", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // Redirect to the homepage on success
                window.location.href = "/";
            } else {
                return response.text().then(errorMessage => {
                    throw new Error(errorMessage);
                });
            }
        })
        .then(() => {
            // Success case already handled above
        })
        .catch(error => {
            // Display specific error messages
            alert(error.message);
            signinButton.disabled = false;
            signinButton.textContent = "Sign in";
        })
        .finally(() => {
            // Re-enable the button in any case
            signinButton.disabled = false;
            signinButton.textContent = "Sign in";
        });
    }
});


  // Input validation on blur
  emailInput.addEventListener("blur", validateEmail)
  passwordInput.addEventListener("blur", validatePassword)

  // Validation functions
  function validateForm() {
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()

    return isEmailValid && isPasswordValid
  }

  function validateEmail() {
    const email = emailInput.value.trim()
    const emailError = document.getElementById("email-error")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email === "") {
      showError(emailInput, emailError, "Email is required")
      return false
    } else if (!emailRegex.test(email)) {
      showError(emailInput, emailError, "Please enter a valid email address")
      return false
    } else {
      showError(emailInput, emailError, "")
      return true
    }
  }

  function validatePassword() {
    const password = passwordInput.value
    const passwordError = document.getElementById("password-error")

    if (password === "") {
      showError(passwordInput, passwordError, "Password is required")
      return false
    } else {
      showError(passwordInput, passwordError, "")
      return true
    }
  }

  function showError(input, errorElement, message) {
    if (message) {
      errorElement.textContent = message
      input.classList.add("error")
    } else {
      errorElement.textContent = ""
      input.classList.remove("error")
    }
  }

  /*function showFormMessage(message, type) {
    formMessage.textContent = message
    formMessage.className = "form-message"
    formMessage.classList.add(type)

    // Hide message after 5 seconds if it's a success message
    if (type === "success") {
      setTimeout(() => {
        formMessage.style.display = "none"
      }, 5000)
    }
  }*/
})

