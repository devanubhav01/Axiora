import { PDFDocument as LibPDFDocument, StandardFonts, rgb } from "pdf-lib";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Ensure resumes folder exists in public directory
const ensureResumesDir = () => {
    const dir = path.join(process.cwd(), "public", "resumes");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

export const generateResumePdf = async (resume, outputPath) => {
    // Create a new PDF document using pdf-lib which has standard fonts built-in as binary arrays (solves path resolution issue)
    const pdfDoc = await LibPDFDocument.create();

    // Embed the standard Helvetica font
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add a blank page to the document (A4 size: 595.28 x 841.89 points)
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    let y = height - 50;

    // Header - Name
    page.drawText(resume.name, {
        x: width / 2 - (fontBold.widthOfTextAtSize(resume.name, 24) / 2),
        y: y,
        size: 24,
        font: fontBold,
        color: rgb(0, 0, 0),
    });
    y -= 25;

    // Subheader - Contact & Education details
    const subheader = `${resume.email}  |  ${resume.college} ${resume.cgpa ? `(CGPA: ${resume.cgpa})` : ""}`;
    page.drawText(subheader, {
        x: width / 2 - (fontRegular.widthOfTextAtSize(subheader, 10) / 2),
        y: y,
        size: 10,
        font: fontRegular,
        color: rgb(118 / 255, 118 / 255, 118 / 255), // #767676
    });
    y -= 15;

    // Social & Coding Profiles Links
    const links = [];
    if (resume.linkedin) links.push(`LinkedIn: ${resume.linkedin}`);
    if (resume.github) links.push(`GitHub: ${resume.github}`);
    if (resume.leetcode) links.push(`LeetCode: ${resume.leetcode}`);
    if (resume.codeforces) links.push(`Codeforces: ${resume.codeforces}`);

    if (links.length > 0) {
        const linksText = links.join("   |   ");
        page.drawText(linksText, {
            x: width / 2 - (fontRegular.widthOfTextAtSize(linksText, 9) / 2),
            y: y,
            size: 9,
            font: fontRegular,
            color: rgb(118 / 255, 118 / 255, 118 / 255), // #767676
        });
        y -= 20;
    }

    // Gray Divider Line
    page.drawLine({
        start: { x: 50, y: y },
        end: { x: width - 50, y: y },
        thickness: 1,
        color: rgb(229 / 255, 231 / 255, 235 / 255), // #e5e7eb
    });
    y -= 25;

    // Helper function to draw sections with text wrapping
    const drawSection = (title, text, size = 10) => {
        if (!text) return;

        // Check if page limit is approaching
        if (y < 80) return;

        // Draw Title
        page.drawText(title, {
            x: 50,
            y: y,
            size: 14,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        y -= 18;

        // Wrap and Draw Body Text
        const words = text.split(" ");
        let line = "";
        const maxWidth = width - 100;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + " ";
            const testLineWidth = fontRegular.widthOfTextAtSize(testLine, size);

            if (testLineWidth > maxWidth && i > 0) {
                if (y < 40) break; // prevent overflowing the page
                page.drawText(line, {
                    x: 50,
                    y: y,
                    size: size,
                    font: fontRegular,
                    color: rgb(51 / 255, 51 / 255, 51 / 255), // #333333
                });
                y -= 14;
                line = words[i] + " ";
            } else {
                line = testLine;
            }
        }

        if (line && y >= 40) {
            page.drawText(line, {
                x: 50,
                y: y,
                size: size,
                font: fontRegular,
                color: rgb(51 / 255, 51 / 255, 51 / 255),
            });
            y -= 25;
        }
    };

    // Draw Sections
    drawSection("Professional Summary", resume.description);
    drawSection("Skills & Expertise", resume.skills);
    drawSection("Certifications & Achievements", resume.certification);

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Write bytes to output file
    fs.writeFileSync(outputPath, pdfBytes);
};

export const sendResumeEmail = async (resume, pdfPath) => {
    // If SMTP credentials aren't provided, skip sending but log it
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("SMTP not configured. Skipping email sending. PDF saved locally.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"Axiora" <${process.env.SMTP_USER}>`,
        to: resume.email,
        subject: `Your Resume PDF - ${resume.name}`,
        text: `Hello ${resume.name},\n\nThank you for using Axiora! Your professional resume PDF has been generated successfully.\n\nYou can find the PDF attached to this email.\n\nBest regards,\nAxiora Team`,
        attachments: [
            {
                filename: `${resume.name.replace(/\s+/g, "_")}_Resume.pdf`,
                path: pdfPath,
            },
        ],
    };

    await transporter.sendMail(mailOptions);
};

export const handleResumeGenerationAndEmail = async (resume) => {
    const resumesDir = ensureResumesDir();
    const pdfPath = path.join(resumesDir, `${resume._id}.pdf`);

    // 1. Generate the PDF
    await generateResumePdf(resume, pdfPath);

    // 2. Send via email
    try {
        await sendResumeEmail(resume, pdfPath);
    } catch (emailError) {
        console.error("Failed to send email:", emailError);
    }
};
