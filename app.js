// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB7_vo-kHjaKPgSrnbFP9dexRIwgb9dKBU",
    authDomain: "directories-dfb9e.firebaseapp.com",
    projectId: "directories-dfb9e",
    storageBucket: "directories-dfb9e.appspot.com",
    messagingSenderId: "1087605860764",
    appId: "1:1087605860764:web:f8f6c56809371679574059",
    measurementId: "G-VJJN5FD82S"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth and Firestore references
const auth = firebase.auth();
const db = firebase.firestore();

// Test Firebase Authentication
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("No user is signed in.");
  }
});

// DOM elements
const navMenu = document.getElementById('nav-menu');
const mainContent = document.getElementById('main-content');

// Router function
function router() {
    const hash = window.location.hash.slice(1) || 'home';
    updateNav();
    switch (hash) {
        case 'home':
            if (auth.currentUser) {
                renderPersonalizedHome(auth.currentUser.uid);
            } else {
                renderHome();
            }
            break;
        case 'login':
            renderLogin();
            break;
        case 'register':
            renderRegister();
            break;
        case 'admin':
            renderAdminPanel();
            break;
        case 'checker':
            renderCheckerDashboard();
            break;
        case 'profile':
            renderProfile();
            break;
        default:
            renderHome();
    }
}

// Update navigation menu
function updateNav() {
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists && doc.data().isAdmin) {
                    navMenu.innerHTML = `
                        <a href="#home">Home</a>
                        <a href="#admin">Admin Panel</a>
                        <a href="#profile">Profile</a>
                        <a href="#" id="logout">Logout</a>
                    `;
                } else {
                    navMenu.innerHTML = `
                        <a href="#home">Home</a>
                        <a href="#checker">Dashboard</a>
                        <a href="#profile">Profile</a>
                        <a href="#" id="logout">Logout</a>
                    `;
                }
                document.getElementById('logout').addEventListener('click', logout);
            }).catch((error) => {
                console.error("Error getting user data:", error);
            });
        } else {
            navMenu.innerHTML = `
                <a href="#home">Home</a>
                <a href="#login">Login</a>
                <a href="#register">Register</a>
            `;
        }
    });
}

// Render functions
function renderHome() {
    mainContent.innerHTML = `
        <h2>Welcome to the Checker Management System</h2>
        <p>Please login or register to continue.</p>
    `;
}

function renderLogin() {
    mainContent.innerHTML = `
        <h2>Login</h2>
        <form id="login-form">
            <input type="email" id="login-email" placeholder="Email" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p id="login-error" class="error-message"></p>
    `;
    document.getElementById('login-form').addEventListener('submit', login);
}

function renderRegister() {
    mainContent.innerHTML = `
        <h2>Register</h2>
        <form id="register-form">
            <input type="text" id="register-name" placeholder="Name" required>
            <input type="email" id="register-email" placeholder="Email" required>
            <input type="password" id="register-password" placeholder="Password" required>
            <input type="tel" id="register-phone" placeholder="Phone Number" required>
            <button type="submit">Register</button>
        </form>
        <p id="register-error" class="error-message"></p>
    `;
    document.getElementById('register-form').addEventListener('submit', register);
}

function renderAdminPanel() {
    if (!auth.currentUser) {
        window.location.hash = '#home';
        return;
    }
    db.collection('users').doc(auth.currentUser.uid).get()
        .then((doc) => {
            if (doc.exists && doc.data().isAdmin) {
                mainContent.innerHTML = `
                    <h2>Admin Panel</h2>
                    <button id="view-all-checkers">View All Checkers</button>
                    <button id="add-task">Add Task</button>
                    <div id="admin-content"></div>
                `;
                document.getElementById('view-all-checkers').addEventListener('click', viewAllCheckers);
                document.getElementById('add-task').addEventListener('click', showAddTaskForm);
            } else {
                window.location.hash = '#home';
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
            window.location.hash = '#home';
        });
}

function renderCheckerDashboard() {
    if (!auth.currentUser) {
        window.location.hash = '#home';
        return;
    }
    const user = auth.currentUser;
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                mainContent.innerHTML = `
                    <h2>Welcome, ${userData.name}</h2>
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h3>Total Tasks</h3>
                            <p id="total-tasks">0</p>
                        </div>
                        <div class="dashboard-card">
                            <h3>Completed Tasks</h3>
                            <p id="completed-tasks">0</p>
                        </div>
                        <div class="dashboard-card">
                            <h3>Pending Tasks</h3>
                            <p id="pending-tasks">0</p>
                        </div>
                    </div>
                    <h3>Your Tasks:</h3>
                    <div id="tasks-list"></div>
                `;
                loadCheckerTasks(user.uid);
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
        });
}

// Authentication functions
function login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Login successful');
            window.location.hash = '#home';
        })
        .catch((error) => {
            console.error('Login error:', error);
            errorElement.textContent = 'Login failed. Please check your credentials.';
        });
}

function register(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const phone = document.getElementById('register-phone').value;
    const errorElement = document.getElementById('register-error');

    errorElement.textContent = '';
    console.log("Attempting to create user with email:", email);

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("User created successfully:", userCredential.user.uid);
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                phoneNumber: phone,
                isAdmin: email === 'admin@gmail.com'
            });
        })
        .then(() => {
            console.log('User data added to Firestore successfully');
            window.location.hash = '#home';
        })
        .catch((error) => {
            console.error('Registration error:', error);
            errorElement.textContent = `Registration failed: ${error.message}`;
        });
}

function logout() {
    auth.signOut().then(() => {
        window.location.hash = '#home';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Admin functions
function viewAllCheckers() {
    db.collection('users').where('isAdmin', '==', false).get()
        .then((querySnapshot) => {
            let checkersHtml = '<h3>All Checkers</h3>';
            if (querySnapshot.empty) {
                checkersHtml += '<p>No checkers found.</p>';
            } else {
                checkersHtml += '<ul>';
                querySnapshot.forEach((doc) => {
                    const checker = doc.data();
                    checkersHtml += `
                        <li>
                            <strong>Name:</strong> ${checker.name}<br>
                            <strong>Email:</strong> ${checker.email}<br>
                            <strong>Phone:</strong> ${checker.phoneNumber}<br>
                            <button onclick="viewCheckerDetails('${doc.id}')">View Details</button>
                        </li>
                    `;
                });
                checkersHtml += '</ul>';
            }
            document.getElementById('admin-content').innerHTML = checkersHtml;
        })
        .catch((error) => {
            console.error("Error getting checkers: ", error);
            document.getElementById('admin-content').innerHTML = '<p>Error loading checkers. Please try again.</p>';
        });
}

function viewCheckerDetails(checkerId) {
    db.collection('users').doc(checkerId).get()
        .then((doc) => {
            if (doc.exists) {
                const checker = doc.data();
                document.getElementById('admin-content').innerHTML = `
                    <h3>Checker Details</h3>
                    <p><strong>Name:</strong> ${checker.name}</p>
                    <p><strong>Email:</strong> ${checker.email}</p>
                    <p><strong>Phone:</strong> ${checker.phoneNumber}</p>
                    <button onclick="viewAllCheckers()">Back to All Checkers</button>
                `;
            } else {
                document.getElementById('admin-content').innerHTML = '<p>Checker not found.</p>';
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
            document.getElementById('admin-content').innerHTML = '<p>Error loading checker details. Please try again.</p>';
        });
}

function deleteChecker(checkerId) {
    db.collection('users').doc(checkerId).update({
        isActive: false
    })
    .then(() => {
        alert('Checker deleted successfully');
        viewCheckers(); // Refresh the list
    })
    .catch((error) => {
        console.error("Error deleting checker: ", error);
    });
}

function showAddTaskForm() {
    document.getElementById('admin-content').innerHTML = `
        <h3>Add Task</h3>
        <input type="text" id="checker-name" placeholder="Checker Name">
        <button onclick="searchChecker()">Search</button>
        <div id="task-form"></div>
    `;
}

function searchChecker() {
    const checkerName = document.getElementById('checker-name').value;
    db.collection('users').where('name', '==', checkerName).where('isAdmin', '==', false).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert('Checker not found');
            } else {
                const checker = querySnapshot.docs[0];
                showTaskForm(checker.id);
            }
        })
        .catch((error) => {
            console.error("Error searching for checker: ", error);
        });
}

function showTaskForm(checkerId) {
    document.getElementById('task-form').innerHTML = `
        <form id="add-task-form">
            <input type="text" id="subject-name" placeholder="Subject Name" required>
            <input type="text" id="subject-code" placeholder="Subject Code" required>
            <input type="text" id="institute-name" placeholder="Institute Name" required>
            <input type="text" id="institute-code" placeholder="Institute Code" required>
            <input type="text" id="packet-code" placeholder="Packet Code" required>
            <input type="text" id="answer-sheet-code" placeholder="Answer Sheet Code" required>
            <button type="submit">Add Task</button>
        </form>
    `;
    document.getElementById('add-task-form').addEventListener('submit', (e) => addTask(e, checkerId));
}

function addTask(e, checkerId) {
    e.preventDefault();
    const task = {
        subjectName: document.getElementById('subject-name').value,
        subjectCode: document.getElementById('subject-code').value,
        instituteName: document.getElementById('institute-name').value,
        instituteCode: document.getElementById('institute-code').value,
        packetCode: document.getElementById('packet-code').value,
        answerSheetCode: document.getElementById('answer-sheet-code').value
    };

    db.collection('users').doc(checkerId).collection('tasks').add(task)
        .then(() => {
            alert('Task added successfully');
            document.getElementById('task-form').innerHTML = '';
        })
        .catch((error) => {
            console.error("Error adding task: ", error);
        });
}

// Checker functions
function loadCheckerTasks(userId) {
    db.collection('users').doc(userId).collection('tasks').get()
        .then((querySnapshot) => {
            let tasksHtml = '<table><tr><th>Subject</th><th>Institute</th><th>Packet Code</th><th>Status</th></tr>';
            let totalTasks = 0;
            let completedTasks = 0;
            querySnapshot.forEach((doc) => {
                const task = doc.data();
                totalTasks++;
                if (task.status === 'completed') completedTasks++;
                tasksHtml += `
                    <tr>
                        <td>${task.subjectName} (${task.subjectCode})</td>
                        <td>${task.instituteName} (${task.instituteCode})</td>
                        <td>${task.packetCode}</td>
                        <td>${task.status}</td>
                    </tr>
                `;
            });
            tasksHtml += '</table>';
            document.getElementById('tasks-list').innerHTML = tasksHtml;
            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('pending-tasks').textContent = totalTasks - completedTasks;
        })
        .catch((error) => {
            console.error("Error getting tasks: ", error);
        });
}

// Profile functions
function viewProfile(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                mainContent.innerHTML = `
                    <h2>Your Profile</h2>
                    <div class="profile-info">
                        <div class="card">
                            <div class="profile-avatar">${userData.name.charAt(0)}</div>
                            <h3>${userData.name}</h3>
                            <p>${userData.email}</p>
                        </div>
                        <div class="card">
                            <h3>Contact Information</h3>
                            <p><strong>Email:</strong> ${userData.email}</p>
                            <p><strong>Phone:</strong> ${userData.phoneNumber}</p>
                        </div>
                    </div>
                    <button id="edit-profile" class="btn-secondary">Edit Profile</button>
                `;
                document.getElementById('edit-profile').addEventListener('click', () => editProfile(userId));
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
        });
}

function editProfile(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                mainContent.innerHTML = `
                    <h2>Edit Your Profile</h2>
                    <form id="edit-profile-form">
                        <input type="text" id="edit-name" value="${userData.name}" required>
                        <input type="password" id="edit-password" placeholder="New Password (leave blank to keep current)">
                        <button type="submit">Save Changes</button>
                    </form>
                    <button onclick="viewProfile('${userId}')">Cancel</button>
                `;
                document.getElementById('edit-profile-form').addEventListener('submit', (e) => updateProfile(e, userId));
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
        });
}

function updateProfile(e, userId) {
    e.preventDefault();
    const newName = document.getElementById('edit-name').value;
    const newPassword = document.getElementById('edit-password').value;

    const updates = { name: newName };

    const updatePromises = [db.collection('users').doc(userId).update(updates)];

    if (newPassword) {
        updatePromises.push(auth.currentUser.updatePassword(newPassword));
    }

    Promise.all(updatePromises)
        .then(() => {
            alert('Profile updated successfully');
            viewProfile(userId);
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
            alert('Error updating profile. Please try again.');
        });
}

// Event listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

console.log('app.js loaded and executed');

function getGreeting(name) {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    return `${greeting}, ${name}!`;
}

function renderPersonalizedHome(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const greeting = getGreeting(userData.name);
                mainContent.innerHTML = `
                    <h2>${greeting}</h2>
                    <div class="card">
                        <p>Welcome to your personalized home page.</p>
                        <p>Here's a summary of your account:</p>
                        <ul>
                            <li><strong>Name:</strong> ${userData.name}</li>
                            <li><strong>Email:</strong> ${userData.email}</li>
                            <li><strong>Phone:</strong> ${userData.phoneNumber}</li>
                        </ul>
                        <div class="btn-group">
                            ${userData.isAdmin ? 
                                '<button onclick="window.location.hash=\'#admin\'" class="btn-secondary">Go to Admin Panel</button>' : 
                                '<button onclick="window.location.hash=\'#checker\'" class="btn-secondary">Go to Dashboard</button>'}
                        </div>
                    </div>
                `;
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
}

function renderProfile() {
    if (!auth.currentUser) {
        window.location.hash = '#home';
        return;
    }
    viewProfile(auth.currentUser.uid);
}