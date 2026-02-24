import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

const AdminSampleReport: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;



    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("expense_report.pdf");
  };

  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
         <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="fixed mt-[50px] top-4 left-4 border border-[#5ABA47] text-[#5ABA47] hover:bg-[#5ABA47] hover:text-white shadow-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      {/* PDF Download Button */}
      <Button
        onClick={handleDownloadPDF}
        className="fixed mt-[50px] top-4 right-4 bg-[#5ABA47] hover:bg-[#4EA13E] text-white shadow-lg"
      >
        <FileDown className="mr-2 h-4 w-4" />
        Download PDF
      </Button>

      {/* Report Container */}
      <div
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden text-gray-800 border border-gray-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-[#5ABA47] text-white px-8 py-5">
          <div>
            <h1 className="text-2xl font-semibold">Expense Report</h1>
            <p className="text-xs opacity-90">Business Expense Summary</p>
          </div>
          <div className="text-2xl font-bold tracking-wider">REPORT</div>
        </div>

        {/* Info Section */}
        <div className="bg-green-50 border-b-2 border-green-100 p-8 space-y-6">
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="uppercase text-gray-600 font-semibold text-xs mb-1">
                Report Name
              </p>
              <p className="font-medium">Business Travel - Q1 2025</p>
            </div>
            <div>
              <p className="uppercase text-gray-600 font-semibold text-xs mb-1">
                Report ID
              </p>
              <p className="font-medium">EXP-2025-00234</p>
            </div>
            <div>
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-semibold">
                Submitted
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="uppercase text-gray-600 text-xs font-semibold mb-1">
                Employee Name
              </p>
              <p className="font-medium">Tushar Sahu</p>
            </div>
            <div>
              <p className="uppercase text-gray-600 text-xs font-semibold mb-1">
                Employee ID
              </p>
              <p className="font-medium">EMP-12345</p>
            </div>
            <div>
              <p className="uppercase text-gray-600 text-xs font-semibold mb-1">
                Department
              </p>
              <p className="font-medium">Engineering - AI Solutions</p>
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div>
          <h2 className="text-lg font-bold text-[#5ABA47] px-8 py-4 border-b-2 border-green-100 bg-green-50">
            Expense Details
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-100 border-b border-green-200 text-gray-700">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Expense Type</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Merchant</th>
                <th className="p-3 text-left">Payment Type</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Jan 05, 2025", "Airfare", "Flight to Bangalore for client meeting", "IndiGo Airlines", "Corporate Card", "₹8,450.00"],
                ["Jan 06, 2025", "Hotel", "Hotel accommodation - 2 nights", "Marriott Bangalore", "Corporate Card", "₹12,000.00"],
                ["Jan 06, 2025", "Meals", "Client dinner meeting", "The Taj Restaurant", "Corporate Card", "₹3,200.00"],
                ["Jan 07, 2025", "Transportation", "Airport taxi and local transport", "Uber", "Personal (Reimbursable)", "₹850.00"],
                ["Jan 07, 2025", "Meals", "Team lunch with developers", "Cafe Coffee Day", "Corporate Card", "₹1,100.00"],
                ["Jan 08, 2025", "Airfare", "Return flight to Raipur", "Air India", "Corporate Card", "₹7,200.00"],
                ["Jan 10, 2025", "Software", "Monthly subscription - AI tools", "GitHub Copilot", "Corporate Card", "₹1,200.00"],
                ["Jan 12, 2025", "Internet", "Mobile data for remote work", "Jio", "Personal (Reimbursable)", "₹599.00"],
                ["Jan 14, 2025", "Office Supplies", "Laptop accessories and cables", "Amazon Business", "Corporate Card", "₹2,450.00"],
              ].map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-green-50 border-b border-gray-100"
                >
                  <td className="p-3">{item[0]}</td>
                  <td className="p-3">
                    <span className="bg-[#EAF7E5] text-[#3F8B32] px-2 py-0.5 rounded text-xs font-medium">
                      {item[1]}
                    </span>
                  </td>
                  <td className="p-3">{item[2]}</td>
                  <td className="p-3">{item[3]}</td>
                  <td className="p-3">{item[4]}</td>
                  <td className="p-3 text-right font-semibold">{item[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="bg-green-50 px-8 py-6 flex justify-end gap-12">
          <div className="text-right">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-xl font-bold text-gray-800">₹37,049.00</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Personal (Reimbursable)</p>
            <p className="text-xl font-bold text-gray-800">₹1,449.00</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-extrabold text-[#5ABA47]">₹37,049.00</p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-[#FCFDF9] border-t border-green-100 px-8 py-5">
          <h3 className="font-bold text-sm mb-2 text-gray-700">
            📝 Business Purpose & Notes
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Business trip to Bangalore for client engagement. Met with the
            development team to discuss AI integration requirements for new
            microservices architecture and infrastructure optimization
            strategies.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-green-50 text-xs text-gray-700 px-8 py-6 border-t border-green-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-800">
                Kloudstac Technologies Pvt Ltd
              </p>
              <p>Bangalore, Karnataka, India</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                Contact Information
              </p>
              <p>Email: tushar.sahu@kloudstac.com</p>
              <p>Phone: +91-9876543210</p>
            </div>
          </div>
          <p className="text-center mt-4 text-gray-500 border-t pt-3">
            This is an auto-generated expense report. For queries, contact the finance team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSampleReport;
