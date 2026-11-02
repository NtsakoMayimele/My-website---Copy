/* Rise Up Hoops - script.js (Part 3)
   Every part checks if its page has the right element first,
   so the same file works on all 5 pages. */

/* The 4 programmes. Change the numbers if you like. */
const programmes = [
    { name: "Seshego",     ageMin: 8,  ageMax: 13, days: "Tuesday & Thursday",         time: "15:00 - 17:00", spots: 12, lat: -23.85, lng: 29.40 },
    { name: "Mankweng",    ageMin: 10, ageMax: 15, days: "Monday, Wednesday & Friday", time: "15:30 - 17:30", spots: 5,  lat: -23.88, lng: 29.72 },
    { name: "Sebayeng",    ageMin: 8,  ageMax: 13, days: "Tuesday & Thursday",         time: "15:00 - 17:00", spots: 8,  lat: -23.76, lng: 29.68 },
    { name: "Lebowakgomo", ageMin: 13, ageMax: 18, days: "Wednesday & Saturday",       time: "09:00 - 11:00", spots: 0,  lat: -24.20, lng: 29.50 }
];

const EMAIL_TO = "hello@riseuphoops.org.za";


/* ---------- 1. ACCORDION (about.html) ---------- */
document.querySelectorAll(".accordion-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        // the answer is the element right after the button
        button.nextElementSibling.classList.toggle("open");
    });
});


/* ---------- 2. GALLERY + LIGHTBOX (about.html) ---------- */
const lightbox = document.getElementById("lightbox");

if (lightbox) {
    document.querySelectorAll(".gallery img").forEach(function (img) {
        img.addEventListener("click", function () {
            document.getElementById("lightbox-img").src = img.src;
            lightbox.classList.add("show");
        });
    });

    // click anywhere on the dark background to close
    lightbox.addEventListener("click", function () {
        lightbox.classList.remove("show");
    });
}


/* ---------- 3. DYNAMIC PROGRAMMES + SEARCH (services.html) ---------- */
const list = document.getElementById("programme-list");

if (list) {
    const searchBox = document.getElementById("search");

    function showProgrammes() {
        const text = searchBox.value.toLowerCase();
        list.innerHTML = "";

        programmes.forEach(function (p) {
            // show the card only if the name or days contain what was typed
            if (p.name.toLowerCase().includes(text) || p.days.toLowerCase().includes(text)) {
                list.innerHTML +=
                    '<div class="card">' +
                    "<h3>" + p.name + "</h3>" +
                    "<p>Ages: " + p.ageMin + "-" + p.ageMax + "</p>" +
                    "<p>" + p.days + " (" + p.time + ")</p>" +
                    "</div>";
            }
        });

        if (list.innerHTML === "") {
            list.innerHTML = "<p>No programmes found.</p>";
        }
    }

    searchBox.addEventListener("input", showProgrammes);
    showProgrammes();   // show all cards when the page loads
}


/* ---------- 4. MAP (services.html) - uses the Leaflet library ---------- */
if (document.getElementById("map") && typeof L !== "undefined") {
    const map = L.map("map").setView([-23.95, 29.55], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    programmes.forEach(function (p) {
        L.marker([p.lat, p.lng]).addTo(map).bindPopup("<b>" + p.name + "</b><br>" + p.days);
    });
}


/* ---------- 5. FORM VALIDATION (used by both forms) ---------- */

// Looks at one field and returns an error message ("" means it's fine)
function getError(input) {
    const value = input.value.trim();

    if (input.required && value === "") { return "This field is required."; }
    if (value === "") { return ""; }   // optional and empty = fine

    if (input.id === "name" && value.length < 2) {
        return "Name must be at least 2 letters.";
    }
    if (input.id === "phone" && !/^(\+27|0)[0-9]{9}$/.test(value.replace(/\s/g, ""))) {
        return "Enter a valid SA number, e.g. 082 456 7890.";
    }
    if (input.id === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
        return "Enter a valid email, e.g. name@example.com.";
    }
    if (input.id === "age" && (value < 5 || value > 18)) {
        return "Age must be between 5 and 18.";
    }
    if (input.id === "children" && (value < 1 || value > 10)) {
        return "Enter a number from 1 to 10.";
    }
    if (input.id === "message" && value.length < 10) {
        return "Message must be at least 10 characters.";
    }
    return "";
}

// Checks every field in a form and shows the errors. Returns true if all fine.
function validateForm(form) {
    let allGood = true;

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
        const error = getError(input);
        document.getElementById(input.id + "-error").textContent = error;
        if (error !== "") { allGood = false; }
    });

    return allGood;
}


/* ---------- 6. ENQUIRY FORM (enquiry.html) ---------- */
const enquiryForm = document.getElementById("enquiry-form");

if (enquiryForm) {
    enquiryForm.addEventListener("submit", async function (event) {
        event.preventDefault();                       // stop the page reloading
        if (!validateForm(enquiryForm)) { return; }   // stop if something is wrong

        const name = enquiryForm.elements["name"].value.trim();
        const age = Number(enquiryForm.elements["age"].value);
        const children = Number(enquiryForm.elements["children"].value);
        const programme = programmes.find(function (p) {
            return p.name === enquiryForm.elements["programme"].value;
        });
        const response = document.getElementById("response");

        // AJAX: send the data in the background (the page does not reload)
        try {
            await fetch(enquiryForm.action, {
                method: "POST",
                body: JSON.stringify({ name: name, age: age, children: children, programme: programme.name })
            });
        } catch (error) {
            response.textContent = "Could not send. Check your internet and try again.";
            return;
        }

        // Cost: 2 or more children = 50% discount
        let cost = "Cost: R50 per month per child.";
        if (children >= 2) {
            cost = "Cost: R25 per month per child (50% discount for signing up " + children + " children!).";
        }

        // Build the reply: availability + cost
        let reply = "Thanks " + name + "! ";

        if (age < programme.ageMin || age > programme.ageMax) {
            reply += programme.name + " is for ages " + programme.ageMin + "-" + programme.ageMax +
                     ". Please pick a programme that fits age " + age + ".";
        } else if (programme.spots > 0) {
            reply += programme.name + " has " + programme.spots + " spots left. " + cost;
        } else {
            reply += programme.name + " is full, so we added you to the waiting list. " + cost;
        }

        response.textContent = reply;
        enquiryForm.reset();
    });
}


/* ---------- 7. CONTACT FORM (contact.html) ---------- */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!validateForm(contactForm)) { return; }

        const name = contactForm.elements["name"].value.trim();
        const type = contactForm.elements["message-type"].value;
        const subject = type + " message from " + name;
        const body =
            "Name: " + name + "\n" +
            "Email: " + contactForm.elements["email"].value.trim() + "\n" +
            "Phone: " + contactForm.elements["phone"].value.trim() + "\n\n" +
            contactForm.elements["message"].value.trim();

        // Show the email, and make the button open the user's email app
        document.getElementById("preview-text").textContent = "To: " + EMAIL_TO + "\nSubject: " + subject + "\n\n" + body;
        document.getElementById("send-email").href =
            "mailto:" + EMAIL_TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        document.getElementById("email-preview").hidden = false;
    });
}


/* ---------- 8. SPECIAL OFFER BUTTON (home + enquiry) ---------- */
const offerButton = document.getElementById("offer-btn");

if (offerButton) {
    offerButton.addEventListener("click", function () {
        // show the box if it's hidden, hide it if it's showing
        document.getElementById("offer-box").hidden = !document.getElementById("offer-box").hidden;
    });
}