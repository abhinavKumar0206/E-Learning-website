const form = document.getElementById('contact-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Add validation logic here

    console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);
    // Send the data to your server or API here
});