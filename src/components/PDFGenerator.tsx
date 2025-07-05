import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface FormData {
  id?: string
  organization_name: string
  date_submission: string
  proposed_dates: Array<{ date: string; description: string }>
  organization_goal: string
  activity_concept: string
  activity_objective: string
  targeted_population: string
  empowerment_opportunities: string
  marketing_opportunities: string
  accreditation_certification: string
  swot_analysis: {
    strengths: string
    weaknesses: string
    opportunities: string
    threats: string
  }
  proposed_venues: Array<{ venue: string; capacity: string; cost: string }>
  task_team: Array<{ name: string; portfolio: string }>
  guest_list: Array<{ name: string; organization: string; contact: string }>
  proposed_programme: string
  task_delegation: Array<{
    activity: string
    person_responsible: string
    assignment_date: string
    target_date: string
    contact_person: string
    telephone: string
  }>
  budget_expenditure: Array<{ description: string; amount: number }>
  budget_income: Array<{ description: string; amount: number }>
  facilitator_recommendation: string
  evaluation: string
  status: string
}

interface PDFGeneratorProps {
  formData: FormData
  onComplete?: () => void
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ formData, onComplete }) => {
  const generatePDF = async () => {
    try {
      // Create a temporary div to render the form content
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '800px'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.padding = '40px'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12px'
      tempDiv.style.lineHeight = '1.4'
      
      // Generate the HTML content
      tempDiv.innerHTML = generateFormHTML(formData)
      
      // Add to document temporarily
      document.body.appendChild(tempDiv)
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Remove temporary div
      document.body.removeChild(tempDiv)
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Generate filename
      const fileName = `SGLD_Form_${formData.organization_name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Download PDF
      pdf.save(fileName)
      
      if (onComplete) {
        onComplete()
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const generateFormHTML = (data: FormData): string => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    const totalExpenditure = data.budget_expenditure?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
    const totalIncome = data.budget_income?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

    return `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Student Government & Leadership Development</h1>
          <h2 style="color: #34495e; margin: 10px 0 0 0; font-size: 20px;">Project Planning Form</h2>
          <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 14px;">Form ID: ${data.id || 'N/A'} | Status: ${data.status?.toUpperCase() || 'DRAFT'}</p>
        </div>

        <!-- Basic Information -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Basic Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 40%; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Organization Name:</td>
              <td style="width: 60%; padding: 8px; border: 1px solid #ddd;">${data.organization_name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Date of Submission:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.date_submission || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Proposed Dates -->
        ${data.proposed_dates && data.proposed_dates.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Proposed Dates</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #ecf0f1;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Description</th>
              </tr>
            </thead>
            <tbody>
              ${data.proposed_dates.map(date => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${date.date || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${date.description || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Project Details -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Project Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 40%; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Organization Goal:</td>
              <td style="width: 60%; padding: 8px; border: 1px solid #ddd;">${data.organization_goal || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Activity Concept:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.activity_concept || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Activity Objective:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.activity_objective || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Targeted Population:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.targeted_population || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Opportunities -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Opportunities</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 40%; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Empowerment Opportunities:</td>
              <td style="width: 60%; padding: 8px; border: 1px solid #ddd;">${data.empowerment_opportunities || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Marketing Opportunities:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.marketing_opportunities || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Accreditation/Certification:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.accreditation_certification || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- SWOT Analysis -->
        ${data.swot_analysis ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">SWOT Analysis</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 25%; padding: 8px; font-weight: bold; border: 1px solid #ddd; background-color: #e8f5e8;">Strengths:</td>
              <td style="width: 75%; padding: 8px; border: 1px solid #ddd;">${data.swot_analysis.strengths || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd; background-color: #ffe8e8;">Weaknesses:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.swot_analysis.weaknesses || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd; background-color: #e8f8ff;">Opportunities:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.swot_analysis.opportunities || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd; background-color: #fff8e8;">Threats:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.swot_analysis.threats || 'N/A'}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        <!-- Proposed Venues -->
        ${data.proposed_venues && data.proposed_venues.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Proposed Venues</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #ecf0f1;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Venue</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Capacity</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Cost</th>
              </tr>
            </thead>
            <tbody>
              ${data.proposed_venues.map(venue => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${venue.venue || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${venue.capacity || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${venue.cost || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Task Team -->
        ${data.task_team && data.task_team.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Task Team</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #ecf0f1;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Name</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Portfolio</th>
              </tr>
            </thead>
            <tbody>
              ${data.task_team.map(member => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${member.name || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${member.portfolio || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Guest List -->
        ${data.guest_list && data.guest_list.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Guest List</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #ecf0f1;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Name</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Organization</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Contact</th>
              </tr>
            </thead>
            <tbody>
              ${data.guest_list.map(guest => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${guest.name || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${guest.organization || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${guest.contact || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Proposed Programme -->
        ${data.proposed_programme ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Proposed Programme</h3>
          <div style="padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 5px;">
            ${data.proposed_programme.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}

        <!-- Task Delegation -->
        ${data.task_delegation && data.task_delegation.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Task Delegation</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background-color: #ecf0f1;">
                <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">Activity</th>
                <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">Person Responsible</th>
                <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">Assignment Date</th>
                <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">Target Date</th>
                <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">Contact Person</th>
                <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">Telephone</th>
              </tr>
            </thead>
            <tbody>
              ${data.task_delegation.map(task => `
                <tr>
                  <td style="padding: 6px; border: 1px solid #ddd;">${task.activity || 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #ddd;">${task.person_responsible || 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #ddd;">${task.assignment_date || 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #ddd;">${task.target_date || 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #ddd;">${task.contact_person || 'N/A'}</td>
                  <td style="padding: 6px; border: 1px solid #ddd;">${task.telephone || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Budget -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Budget</h3>
          
          <div style="display: flex; gap: 20px;">
            <!-- Expenditure -->
            <div style="flex: 1;">
              <h4 style="color: #34495e; margin-bottom: 10px;">Estimated Expenditure</h4>
              ${data.budget_expenditure && data.budget_expenditure.length > 0 ? `
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #ecf0f1;">
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Description</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.budget_expenditure.map(item => `
                      <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.description || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.amount || 0)}</td>
                      </tr>
                    `).join('')}
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                      <td style="padding: 8px; border: 1px solid #ddd;">Total Expenditure:</td>
                      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalExpenditure)}</td>
                    </tr>
                  </tbody>
                </table>
              ` : '<p>No expenditure items listed</p>'}
            </div>

            <!-- Income -->
            <div style="flex: 1;">
              <h4 style="color: #34495e; margin-bottom: 10px;">Estimated Income</h4>
              ${data.budget_income && data.budget_income.length > 0 ? `
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #ecf0f1;">
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Description</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.budget_income.map(item => `
                      <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.description || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.amount || 0)}</td>
                      </tr>
                    `).join('')}
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                      <td style="padding: 8px; border: 1px solid #ddd;">Total Income:</td>
                      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalIncome)}</td>
                    </tr>
                  </tbody>
                </table>
              ` : '<p>No income items listed</p>'}
            </div>
          </div>

          <!-- Net Balance -->
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Net Balance</h4>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${totalIncome - totalExpenditure >= 0 ? '#27ae60' : '#e74c3c'};">
              ${formatCurrency(totalIncome - totalExpenditure)}
            </p>
          </div>
        </div>

        <!-- Additional Information -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">Additional Information</h3>
          
          ${data.facilitator_recommendation ? `
          <div style="margin-bottom: 15px;">
            <h4 style="color: #34495e; margin-bottom: 8px;">Facilitator's / HOD Recommendation</h4>
            <div style="padding: 12px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 5px;">
              ${data.facilitator_recommendation.replace(/\n/g, '<br>')}
            </div>
          </div>
          ` : ''}

          ${data.evaluation ? `
          <div style="margin-bottom: 15px;">
            <h4 style="color: #34495e; margin-bottom: 8px;">Evaluation</h4>
            <div style="padding: 12px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 5px;">
              ${data.evaluation.replace(/\n/g, '<br>')}
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #7f8c8d; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Student Government & Leadership Development Project Planning Form</p>
        </div>
      </div>
    `
  }

  return (
    <button
      onClick={generatePDF}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Download PDF</span>
    </button>
  )
}

export default PDFGenerator 