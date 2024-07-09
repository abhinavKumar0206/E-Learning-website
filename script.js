const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // to parse JSON bodies

mongoose.connect('mongodb://127.0.0.1:27017/students');
const db = mongoose.connection;

db.once('open', () => {
    console.log("Mongodb connection successful");
});

const userSchema = new mongoose.Schema({
    student_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email_id: { type: String, required: true },
    employee_id: { type: String, required: true },
    aadhaar_no: { type: String, required: true },
    password: { type: String, required: true },
    mobile_no: { type: String, required: true },
    gender: { type: String, required: true }
});

const Users = mongoose.model("student_info", userSchema);

// Counter schema for auto-incrementing student_id
const counterSchema = new mongoose.Schema({
    id: { type: String },
    seq: { type: Number }
});

const Counter = mongoose.model("counter", counterSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'next.html'));
});

app.post('/post', async (req, res) => {
    let seqId;

    try {
        const counterDoc = await Counter.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true, upsert: true }
        );

        seqId = counterDoc.seq;

        const { name, email_id, employee_id, aadhaar_no, password, mobile_no, gender } = req.body;
        
        const user = new Users({
            name,
            email_id,
            employee_id,
            aadhaar_no,
            password,
            mobile_no,
            gender,
            student_id: seqId
        });

        await user.save();
        res.json({ message: 'Student registration successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Users.findOne({ employee_id: username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username' });
        }
        
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid password' });
        }  
        
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Define the admin_table schema
const adminSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.String, ref: 'EmployeeInfo', required: true, unique: true },
    subject: {type: String, enum: ['Physics', 'Chemistry', 'Biology', 'Maths']},
    password: { type: String, required: true },
    repassword:{ type: String, required: true }
    
});

const Admin = mongoose.model("admin_info", adminSchema); // Model for admin collection

// Serve the admin registration form
app.get('/admin_register', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_registration.html'));
});

// Handle admin registration form submission
app.post('/admin_register', async (req, res) => {
    const { employee_id,subject,password,repassword } = req.body;

    if (password !== repassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const admin = new Admin({
        employee_id,
        subject,
        password,
        repassword
        
    });

    try {
        await admin.save();
        res.json({ message: 'Admin registration successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin login route
app.post('/logina', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ employee_id: username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid username' });
        }
        
        if (password !== admin.password) {
            return res.status(401).json({ error: 'Invalid password' });
        }  
        
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*const mySchema = new mongoose.Schema({
    employee_id:{type: String, required: true, unique: true},
    name: {type: String, required: true},
    designation: {type: String, required: true},
    email_id: {type: String, required: true},
    mobile_no:{type: String, required: true},
    aadhaar_no:{type: String, required: true},
    gender: {type: String, required: true }
}, { collection: 'employee_info' }); // Specify the existing collection name

// Create a model based on the schema
const EmployeeInfo = mongoose.model('EmployeeInfo', mySchema);*/



//fetching name of teachers subject wise
app.get('/employees/:subject', async (req, res) => {
    const { subject } = req.params;
    try {
        const employees = await Admin.find({ subject }).select('employee_id'); // Adjust the field if needed
        //const employeeNames = await EmployeeInfo.find({ _id: { $in: employees.map(emp => emp.employee_id) } }).select('name');

        //const employees2=await EmployeeInfo.find({employee_id}).select('name');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const discussionSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.Number, ref: 'student_info', required: true },
    employee_id: { type: mongoose.Schema.Types.String, ref: 'employee_info', required: true },
    question: { type: String, required: true },
    asked_date: { type: Date, required: true },
    resolved_date: { type: Date, default: null },
    resolved: { type: Boolean, default: false }
});

const Discussion = mongoose.model("discussion", discussionSchema);

app.post('/discussions', async (req, res) => {
    const { student_id, employee_id, question, asked_date } = req.body;

    const discussion = new Discussion({
        student_id,
        employee_id,
        question,
        asked_date,
        resolved_date: null,
        resolved: false
    });

    try {
        await discussion.save();
        res.json({ message: 'Discussion saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
