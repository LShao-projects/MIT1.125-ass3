from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4,landscape
from reportlab.pdfgen import canvas
from pypdf import PdfReader
import json
from pathlib import Path
out=Path('output/pdf'); data=json.load(open('output/committee-values.json')); styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='Body2',fontName='Helvetica',fontSize=10,leading=14,spaceAfter=9));styles['Title'].textColor=colors.HexColor('#25495a');styles['Heading2'].textColor=colors.HexColor('#326658')
story=[]
def para(t):story.append(Paragraph(t,styles['Body2']))
def head(t):story.append(Paragraph(t,styles['Heading2']))
story.append(Paragraph('COMMON GROUND | Investment memo',styles['Title']));para('Committee review draft | 6 October 2026 | France / Paris-Saclay study region')
head('Decision: send back for more evidence')
para('Recommend France as the priority country for the proposed 25 MW university AI datacenter and retain its initial technical design. Return the construction investment for more evidence: signed member demand, a grid connection offer and comparable supplier bids are missing. Continue comparing build, lease and phased hybrid before committing funds.')
head('What is being reviewed')
para('The original proposal is 20 MW IT at PUE 1.25: 25 MW facility power and 219 GWh/year at continuous full load. Members have expressed interest but have not signed long-term compute commitments. Grid connection price, upgrades and energization date remain unknown. The Paris-Saclay region is a provisional study location, not a selected parcel.')
para('France has the lowest saved reference tariff: EUR 0.0614/kWh versus Sweden 0.0644 and Germany 0.1307 (S-EUROSTAT, 2025-S2). Sweden has lower generation carbon intensity: 34.9 versus France 40.3 and Germany 339.9 gCO2e/kWh (S-EMBER, 2024 snapshot). We prioritize electricity cost between France and Sweden; Sweden remains the alternative. Paris-Saclay is provisional, not a proven best French site.')
para('Planning demand remains an uncommitted 28 million productive GPU-hours/year and 5,000 peak GPUs. These assumptions leave substantial spare capacity in the 20 MW IT proposal. A 10 MW case is an optional sensitivity, not a change to the main proposal. The current model favors leasing on unit cost; quotes must confirm that result.')
head('Three alternatives; one assumed workload')
para('Full build owns the original 20 MW IT fleet. Hybrid owns 8 MW IT and contracts for the residual workload. Lease buys equivalent compute with a minimum commitment. All three serve the same assumed productive demand; national electricity price is a reference, not a site offer.')
rows=[['Base case','Before opening','Year 1 OPEX','EUR/GPU-h','Capital at risk']]
for r in data['results']:
 if r['scenario']=='base':rows.append([r['route'].title(),f"EUR {r['preOpeningCash']/1e6:.1f}m",f"EUR {r['annualOpex'][0]/1e6:.1f}m",f"{r['costPerGpuHour']:.2f}",f"EUR {r['capitalAtRisk']/1e6:.1f}m"])
t=Table(rows,colWidths=[70,105,90,75,110]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6efea')),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),8.5),('BOTTOMPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('LINEBELOW',(0,0),(-1,-1),.3,colors.lightgrey)]));story.append(t);story.append(Spacer(1,10))
para('Screening model: ten years, constant euros, no discounting. Facility/grid capital and GPU purchases/replacement are separate. Cost per productive GPU-hour includes net capital, operating and financing outflows less terminal recovery. France reference electricity: EUR 0.0614/kWh, Eurostat 2025-S2. Other costs are illustrative assumptions, not bids.')
story.append(PageBreak());head('Stress cases and funding exposure')
rows=[['Full build','Before opening','Year 1 OPEX','EUR/GPU-h','Capital at risk']]
for r in data['results']:
 if r['route']=='build':rows.append([{'base':'Base','delay':'Grid +1 year','half':'Half use'}[r['scenario']],f"EUR {r['preOpeningCash']/1e6:.1f}m",f"EUR {r['annualOpex'][0]/1e6:.1f}m",f"{r['costPerGpuHour']:.2f}",f"EUR {r['capitalAtRisk']/1e6:.1f}m"])
t=Table(rows,colWidths=[70,105,90,75,110]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6efea')),('FONTSIZE',(0,0),(-1,-1),8.5),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]));story.append(t);story.append(Spacer(1,10))
para('Delay assumes owned operation begins in year 2, with temporary leasing during year 1. Before-opening cash includes year 0 plus year 1 net outflows, including deferred GPUs and financing. Half use retains the fleet and fixed costs; idle IT still draws power. Capital at risk is unrecovered initial capital plus minimum/bridge lease exposure, not a probability-weighted loss. The website shows all nine combinations and annual cash flows.')
head('Three findings most likely to change the decision')
para('<b>1. Committed demand.</b> Obtain member GPU-hour and payment commitments, peak-cluster benchmarks, class calendars, availability/security needs and exit obligations. Adequate commitments at sustainable prices may support ownership; weak demand favors a smaller phase or leasing.')
para('<b>2. Deliverable power and site.</b> Obtain a grid offer with date, upgrade cost, permits and cost allocation to other customers. Validate critical-load failure paths, 48-hour fuel logistics, cooling and water limits. A long delay or infeasible site may remove the build option.')
para('<b>3. Comparable supply bids.</b> Compare construction, GPU procurement/finance and equivalent lease offers under the same workload, security, availability and replacement assumptions. Include unused-capacity and member-withdrawal risk. Lower modeled cost alone is insufficient.')
head('Ownership, governance and financing gates')
para('If ownership is later approved, the consortium owns facility and internal infrastructure, and owns or finances its GPU share; contract construction, specialist maintenance, fuel and diverse external circuits. Development equity requires a bounded study; construction debt requires permits, utility terms, bids and commitments; equipment financing should match energization. The consortium bears delay and underuse unless contracts explicitly transfer them.')
para('Reserve teaching and small-member quotas, release unused reservations, publish marginal-use prices, and use a member committee for admission, scheduling disputes and appeals. Require capped, agreed exit obligations; avoid shifting uncapped costs to smaller institutions.')
para('<b>Evidence and limits:</b> S-CALC is the application model; S-EUROSTAT is the national price series. Country counts and consumption have different scopes and years; see website Evidence for source URLs and limitations. No construction-ready engineering, professional certification or committed financing is claimed. The website records human source checks; this revised memo and local pages still require publication and final acceptance.')
def footer(c,d):c.setFont('Helvetica',8);c.setFillColor(colors.grey);c.drawString(42,25,'Common Ground | Committee review draft | 2026-10-06');c.drawRightString(A4[0]-42,25,str(d.page))
SimpleDocTemplate(str(out/'investment-memo.pdf'),pagesize=A4,leftMargin=42,rightMargin=42,topMargin=34,bottomMargin=40).build(story,onFirstPage=footer,onLaterPages=footer)
assert len(PdfReader(out/'investment-memo.pdf').pages)==2
if '--memo-only' in __import__('sys').argv: raise SystemExit(0)
c=canvas.Canvas(str(out/'system-diagram.pdf'),pagesize=landscape(A4));w,h=landscape(A4);c.setTitle('Common Ground - initial system and failure paths');c.setFont('Helvetica-Bold',20);c.drawString(36,h-40,'COMMON GROUND | Initial system and failure paths');c.setFont('Helvetica',10);c.drawString(36,h-60,'20 MW IT / PUE 1.25 / 25 MW facility | Planning assumptions, not engineering certification')
def box(x,y,bw,bh,label,sub):
 c.setFillColor(colors.HexColor('#eef4f0'));c.setStrokeColor(colors.HexColor('#426d60'));c.roundRect(x,y,bw,bh,6,fill=1);c.setFillColor(colors.HexColor('#25495a'));c.setFont('Helvetica-Bold',11);c.drawCentredString(x+bw/2,y+bh-21,label);c.setFont('Helvetica',9);c.drawCentredString(x+bw/2,y+13,sub)
def arrow(x,y,xx,yy):
 c.setStrokeColor(colors.HexColor('#426d60'));c.line(x,y,xx,yy);c.line(xx,yy,xx-4,yy+7);c.line(xx,yy,xx+4,yy+7)
box(50,425,315,52,'Utility connection','Capacity, upgrades and energization unknown');box(475,425,315,52,'Standby generation','Fuel, start reliability and derating to verify');arrow(207,425,290,388);arrow(630,425,550,388)
box(180,336,480,52,'Independent distribution trains A / B','Each proposed for 100% critical load; common-mode failures unresolved');arrow(315,336,250,302);arrow(540,336,610,302)
box(50,248,380,54,'UPS -> GPU hosts + storage + internal network','10-minute bridge assumption: 25 MW x 10/60 = 4.17 MWh');box(465,248,325,54,'Liquid cooling -> heat rejection','Dry rejection proposed; water and weather study needed');arrow(245,248,245,220)
box(50,169,380,51,'External carriers A / B','Separate physical paths; diversity requires verification')
c.setFillColor(colors.HexColor('#25495a'));c.setFont('Helvetica-Bold',11);c.drawString(465,218,'Largest train fails');c.setFont('Helvetica',9)
for i,t in enumerate(['Transfer to surviving 25 MW train if ratings/tests permit.','If transfer fails, shed training; protect critical services.','Storage, controls and cooling must survive the same event.']):c.drawString(465,201-i*13,t)
c.setFont('Helvetica-Bold',11);c.drawString(50,139,'48 hours without grid');c.setFont('Helvetica',9)
for i,t in enumerate(['UPS bridges start; generators must supply IT, network, storage and cooling. At full load: 25 x 48 = 1,200 MWh.', 'Illustrative fuel factor 0.25 L/kWh implies 300,000 L before reserve. Not a tank-size or autonomy guarantee.', 'Verify fuel curves, usable stock, replenishment, emission permits, protection coordination, cooling restart and integrated failure tests.', 'No firm solar/wind credit. Proposed 99.9% service target remains unproven; checkpoints protect restartable training work.']):c.drawString(50,122-i*15,t)
c.setFont('Helvetica',8);c.drawString(50,35,'S-CALC | Original full-build baseline, not hybrid/lease design | Team review required | 2026-10-06');c.save();assert len(PdfReader(out/'system-diagram.pdf').pages)==1
print('Verified page counts: memo 2; system diagram 1')
