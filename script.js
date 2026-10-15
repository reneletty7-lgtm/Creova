const form = document.getElementById("registerForm");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (name.length < 2) { alert("Please enter your full name."); return; }
    if (password.length < 5) { alert("Password must be at least 5 characters."); return; }
    if (password !== confirmPassword) { alert("Passwords do not match!"); return; }

    try {
      localStorage.setItem("creovaUser", JSON.stringify({ name: name, contact: contact, password: password }));
    } catch (e) {
      alert("Could not save your account on this device. Please try again.");
      return;
    }

    alert("Registration successful! Welcome to Creova, " + name);
    window.location.href = "home.html";
  });
}