import os
import re
import pandas as pd
from PyPDF2 import PdfReader

# Step 1: Read PDF content
def read_pdf(path):
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Step 2: Extract sections using LaTeX-style tags
def extract_sections_latex(text):
    sections = {}
    # Regex to capture sections marked with \section{}
    matches = re.findall(r'\\section\{(.*?)\}(.*?)(?=\\section|$)', text, re.DOTALL)
    for title, content in matches:
        sections[title.strip()] = content.strip()
    return sections

# Step 3: Define keywords for 18 questions (dummy keywords)
questions_keywords = {
    "Question 1": ["consumer behavior", "firm theory", "microeconomics", "economic theory"],
    "Question 2": ["contact", "email", "instructor", "Dr. Anoshua Chaudhuri", "office hours"],
    "Question 3": ["assignments", "announcements", "class communications", "iLearn", "Canvas", "online platform"],
    "Question 4": ["attendance", "policy", "responsibility", "assignments", "engagement", "falling behind"],
    "Question 5": ["grading", "evaluation", "learning curve activity", "homework", "exams", "forum posts", "reflection assignment"],
    "Question 6": ["syllabus", "schedule", "course content", "objectives", "teaching methods"],
    "Question 7": ["homework", "deadlines", "exams", "timed exams", "assignments", "grade penalty"],
    "Question 8": ["textbooks", "materials", "study resources", "class webpage", "course materials"],
    "Question 9": ["office hours", "availability", "zoom", "in-person meetings", "weekly office hours"],
    "Question 10": ["discussion", "participation", "forum posts", "engagement", "class communication"],
    "Question 11": ["group work", "collaboration", "forum posts", "engagement", "learning from peers"],
    "Question 12": ["extra credit", "bonus", "course engagement", "assignments"],
    "Question 13": ["exams", "quizzes", "timed exams", "evaluation", "grading scale"],
    "Question 14": ["feedback", "responses", "course review", "reflection assignment", "engagement"],
    "Question 15": ["projects", "deliverables", "exams", "learning curve activity", "assignments"],
    "Question 16": ["resources", "support", "DPRC", "assistance", "engagement", "materials"],
    "Question 17": ["policies", "rules", "attendance policy", "responsibility", "class expectations"],
    "Question 18": ["learning outcomes", "objectives", "course outcomes", "skills", "economic theory", "quantitative methods"],
}


# Step 4: Analyze sections for keywords
def analyze_keywords(sections, questions_keywords):
    heatmap_data = {question: [] for question in questions_keywords}
    for section_name, content in sections.items():
        for question, keywords in questions_keywords.items():
            count = sum(content.lower().count(keyword.lower()) for keyword in keywords)
            heatmap_data[question].append(count)
    return heatmap_data, list(sections.keys())

# Step 5: Export to CSV
def export_heatmap_data(heatmap_data, section_names, output_path):
    df = pd.DataFrame(heatmap_data, index=section_names)
    df.to_csv(output_path)
    print(f"Heatmap data saved to {output_path}")

# Main script
pdf_path = "/Users/ashmithapais/17thMay/SocialJusticeTool/ApplicationSJ/Back-End/media/file_uploads/file1.pdf"  # Replace with your actual PDF path

# Set the output path to the React public folder
react_public_folder = "/Users/ashmithapais/17thMay/SocialJusticeTool/ApplicationSJ/front-end/public"  # Replace with your actual React project's public folder path
output_path = os.path.join(react_public_folder, "heatmap_data.csv")

# Read PDF and extract sections
text = read_pdf(pdf_path)
sections = extract_sections_latex(text)

# Analyze keywords and export to CSV
heatmap_data, section_names = analyze_keywords(sections, questions_keywords)
export_heatmap_data(heatmap_data, section_names, output_path)
