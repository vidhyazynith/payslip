// ================================
// Backend: Employee Payslip System
// ================================

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const numberToWords = require("number-to-words");
const cors = require("cors");


const app = express();
app.use(bodyParser.json());
app.use(cors());

// ================================
// MongoDB connection
// ================================
mongoose.connect("mongodb://127.0.0.1:27017/employees", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("Mongo Error:", err));

// ================================
// Employee Schema
// ================================
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation: String,
    salary: Number,
    employeeId: { type: String, required: true, unique: true },

    month: { type: String, required: true },
    payDate: { type: Date, default: () => new Date() },
    netPay: { type: Number, required: true ,default:0},
    grossEarnings: { type: Number, required: true ,default:0},
    totalDeductions: { type: Number, required: true ,default:0},
    paidDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },
    remainingLeave: { type: Number, default: 0 },
    leavesTaken: Number,
    earnings: [
        { type: { type: String, required: true }, amount: { type:Number, required: true } }
    ],
    deductions: [
        { type: { type: String, required: true }, amount: { type:Number, required: true } }
    ]
});

 employeeSchema.pre('save', function(next) {

    this.grossEarnings = this.earnings.reduce((sum, e) => sum + e.amount, 0);
    this.totalDeductions = this.deductions.reduce((sum, d) => sum +d.amount, 0);
    this.netPay = this.grossEarnings;
    this.salary = this.grossEarnings - this.totalDeductions;
    if (this.salary < 0) {
        this.salary = 0;
    }
    next();
});

const Employee = mongoose.model("Employee", employeeSchema);

// ================================
// Nodemailer Setup
// ================================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abukutty56@gmail.com",   // Your Gmail
        pass: "pghy hnjk lktr bcab"      // Gmail App Password
    }
});

function roundedRect(doc, x, y, width, height, radius) {
  doc.moveTo(x + radius, y)
    .lineTo(x + width - radius, y)
    .quadraticCurveTo(x + width, y, x + width, y + radius)
    .lineTo(x + width, y + height - radius)
    .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    .lineTo(x + radius, y + height)
    .quadraticCurveTo(x, y + height, x, y + height - radius)
    .lineTo(x, y + radius)
    .quadraticCurveTo(x, y, x + radius, y)
    .closePath();
}


// ================================
// PDF Generation Function
// ================================
function generatePayslip(emp) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname,`${emp.employeeId}_${emp.name.replace(/\s+/g, "_")}_Payslip.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Company Header
        doc.image(path.join(__dirname, "logo.png"), 50, 40, { width:40 }); // company logo
        doc.fontSize(18).fillColor("#000").text("Zynith IT Solutions", 100, 45);
        doc.fontSize(10).fillColor("gray").text("Chennai, India", 100, 65);
        doc.fontSize(15).fillColor("gray").text("Payslip For the Month", 400, 47);
        doc.fontSize(12).text(`${emp.month}`, 475, 75);

        doc.moveTo(50, 100).lineTo(550, 100).strokeColor("#ccc").stroke();

        doc.fontSize(12).fillColor("black").text("EMPLOYEE SUMMARY", 50, 120);
        doc.fontSize(11).fillColor("gray").text("Employee Name", 50, 160);
        doc.text(":", 138, 160);
        doc.fontSize(11).fillColor("black").text(emp.name, 150, 160);

        doc.fontSize(11).fillColor("gray").text("Employee ID", 50, 180);
        doc.text(":", 138, 180);
        doc.fontSize(11).fillColor("black").text(emp.employeeId, 150, 180);

        doc.fontSize(11).fillColor("gray").text("Pay Period", 50, 200);
        doc.text(":", 138, 200);
        doc.fontSize(11).fillColor("black").text(emp.month, 150, 200);

        doc.fontSize(11).fillColor("gray").text("Pay Date", 50, 220);
        doc.text(":", 138, 220);
        doc.fontSize(11).fillColor("black").text(`${(emp.payDate).toLocaleDateString("en-GB")}`,150, 220);


        const boxX = 350;
        const boxY = 120;
        const boxWidth = 200;
        const boxHeight = 120;
        const radius = 10;

        doc.save();
        doc.roundedRect(boxX, boxY, boxWidth, boxHeight-65, radius)
        .fillOpacity(1)   // solid
        .fillAndStroke("#f2fef6", "#cccccc"); // very light green + grey border
        doc.restore();

         doc.save();
        doc.roundedRect(boxX, boxY+68, boxWidth, boxHeight-65, radius)
        .fillOpacity(1)   // solid
        .fillAndStroke("#e6f3ff", "#cccccc"); // very light green + grey border
        doc.restore();




         // ✅ Bold Green Net Pay
        doc.fontSize(18).fillColor("#0a9f49").font("Helvetica-Bold")
        .text("Rs.", boxX+15, boxY+15);
        doc.text(emp.netPay.toFixed(2), boxX + 46, boxY + 15);

        doc.fontSize(11).fillColor("gray").font("Helvetica")
        .text("Total Net Pay", boxX+15, boxY + 32);

         // Paid Days / LOP Days
        doc.fontSize(11).fillColor("black").text("Paid Days :", boxX +20, boxY + 80);
        doc.text(emp.paidDays, boxX + 120, boxY + 80);

        doc.text("LOP Days :", boxX + 20, boxY + 100);
        doc.text(emp.lopDays, boxX + 120, boxY + 100);

        doc.moveTo(50, 263).lineTo(550, 263).strokeColor("#ccc").stroke();

        doc.moveDown(2);

        doc.fontSize(11).fillColor("gray").text("Remaining Leave", 50, 273);
        doc.text(":", 138, 273);
        doc.fontSize(11).fillColor("black").text(emp.remainingLeave, 150, 273);

        doc.fontSize(11).fillColor("gray").text("Leaves Taken", 290, 273);
        doc.text(":", 378, 273);
        doc.fontSize(11).fillColor("black").text(emp.leavesTaken, 390, 273);

        const tableX = 50;
        const tableY = 300;
        const tableWidth = 500;
        const tableHeight = 120;



        doc.save();
        doc.roundedRect(tableX, tableY, tableWidth, tableHeight+20, radius)
        .fillAndStroke("#ffffff","#cccccc"); // very light green + grey border
        doc.restore();

        // Table Headers
        doc.fontSize(11).font("Helvetica-Bold").fillColor("black");

        doc.text("EARNINGS", tableX + 20, tableY + 10);
        doc.text("AMOUNT", tableX + 170, tableY + 10);

        doc.text("DEDUCTIONS", tableX + 270, tableY + 10);
        doc.text("AMOUNT", tableX + 430, tableY + 10);

        doc.moveTo(tableX + 20, tableY + 28)
        .lineTo(270, tableY + 28)
        .dash(2, { space: 2 })
        .strokeColor("#999999")
        .stroke()
        .undash();

         doc.moveTo(320, tableY + 28)
        .lineTo(530, tableY + 28)
        .dash(2, { space: 2 })
        .strokeColor("#999999")
        .stroke()
        .undash();

    // Reset font
        doc.fontSize(11).font("Helvetica").fillColor("black");

        let y = tableY + 50;
        emp.earnings.forEach(e => {
            doc.text(`${e.type}`, tableX + 20, y);
            doc.text(`Rs . ${e.amount.toFixed(2)}`, tableX + 140, y, { align:"right", width: 80 });
            doc.font("Helvetica");
            y += 20;
        });

        doc.font("Helvetica");

// Deductions Loop (separate y2, same alignment as before)
        let y2 = tableY + 50;
        emp.deductions.forEach(d => {
            doc.text(`${d.type}`, tableX + 270, y2);
            doc.text(`Rs . ${d.amount.toFixed(2)}`, tableX + 400, y2, { align:"right", width: 80 });
            doc.font("Helvetica");
            y2 += 20;
        });

        doc.moveTo(tableX + 20, 415)
        .lineTo(270, 415)
        .dash(2, { space: 2 })
        .strokeColor("#999999")
        .stroke()
        .undash();

        doc.moveTo(320, 415)
        .lineTo(530, 415)
        .dash(2, { space: 2 })
        .strokeColor("#999999")
        .stroke()
        .undash();

        //let bottomY = tableY + tableHeight - 30;
        doc.font("Helvetica-Bold").text("Gross Earnings", tableX + 20, 425);
        doc.text(`Rs . ${emp.grossEarnings.toFixed(2)}`, tableX + 140, 425, {align: "right", width: 80 });

        doc.font("Helvetica-Bold").text("Total Deductions", tableX + 270, 425);
        doc.text(`Rs . ${emp.totalDeductions.toFixed(2)}`, tableX + 400, 425, {align: "right", width: 80 });




        doc.save();
        doc.roundedRect(50, 470, 500, 45, radius)
        .strokeColor("#cccccc")
        .lineWidth(1)
        .stroke();

        const greenWidth = 150; // adjust width of green area
        doc.save();
        doc.roundedRect(50 + (500 - greenWidth), 470, greenWidth, 45, radius)
            .clip(); // clip only right section
        doc.rect(50 + (500 - greenWidth), 470, greenWidth, 45)
            .fill("#e6f9ef"); // light green fill
        doc.restore();

  // Left text
  doc.font("Helvetica-Bold").fontSize(10).fillColor("black")
    .text("TOTAL NET PAYABLE", 50 + 10, 470 + 13);

  doc.font("Helvetica").fontSize(10).fillColor("gray")
    .text("Gross Earnings - Total Deductions", 50 + 10, 470 + 27);

  // Right text (Net Pay in bold)
  doc.font("Helvetica-Bold").fontSize(14).fillColor("black")
    .text(`Rs. ${emp.salary.toFixed(2)}`, 310, 470 + 18, {
      align: "right",
      width: boxWidth - 10
    });

        const amountWords =numberToWords.toWords(emp.salary).replace(/\b\w/g, c =>c.toUpperCase());
        doc.font("Helvetica-Bold").fontSize(10).fillColor("black").text(`${amountWords}Rupees Only`, 50, 530, { width: 380, align: "center" });
        doc.moveTo(50, 550).lineTo(550, 550).strokeColor("#ccc").stroke();


        //-------------------------------------------------------------------


        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

// ================================
// API: Add Employee
// ================================
app.post("/add-employee", async (req, res) => {
    try {
        const employeeData = req.body;

        // Format dates
        
        
        if (employeeData.payDate) {
            employeeData.payDate = new Date(employeeData.payDate);
        }

        // Validation
        if (!employeeData.earnings || !employeeData.deductions) {
            return res.status(400).json({ error: "Earnings andDeductions arrays are required" });
        }

        const employee = new Employee(employeeData);
        await employee.save();
        res.json({ message: "Employee added successfully with fullpayslip details", employee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// API: Send Payslips
// ================================
app.get("/send-payslips", async (req, res) => {
    try {
        const employees = await Employee.find();

        for (const emp of employees) {
            const pdfPath = await generatePayslip(emp);

            // Send Email
            await transporter.sendMail({
                from: "abukutty56@gmail.com",
                to: emp.email,
                subject: "Your Monthly Payslip",
                text: `Hi ${emp.name},\n\nPlease find your payslip attached.`,
                attachments: [{ filename: path.basename(pdfPath),
path: pdfPath }]
            });

            console.log(`Payslip sent to ${emp.email}`);

            // Delete PDF after sending
            fs.unlinkSync(pdfPath);
        }

        res.json({ message: "All payslips sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ================================
// API: get all Employee
// ================================

app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/employee/:employeeId", async (req, res) => 
    { try
         { 
            const { employeeId } = req.params; 
            const employee = await Employee.findOne({ employeeId }); 
            if (!employee) { return res.status(404).json({ error: "Employee not found" });
         } res.json(employee);
         } 
         catch (err) { 
            res.status(500).json({ error: err.message });
         } });

// ================================
// API: Update Employee
// ================================
app.put("/update-employee/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const updatedData = req.body;

        // Check if employee exists
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Update employee data
        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId },
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        res.json({
            message: "✅ Employee updated successfully",
            employee: updatedEmployee
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// API: Delete Employee
// ================================
app.delete("/delete-employee/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;

        const deletedEmployee = await Employee.findOneAndDelete({ employeeId });
        if (!deletedEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.json({ message: "🗑️ Employee deleted successfully",
employee: deletedEmployee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// Start Server
// ================================
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));