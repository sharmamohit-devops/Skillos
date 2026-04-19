import pandas as pd
import requests
import zipfile
import os
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class DatasetLoader:
    """
    Load and preprocess datasets mentioned in hackathon requirements:
    1. Resume Dataset from Kaggle
    2. O*NET Database
    3. Jobs and Job Description Dataset
    """

    def __init__(self, data_dir: str = "data/raw"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

        # Dataset URLs and info
        self.datasets = {
            "resume": {
                "url": "https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset/data",
                "description": "Resume dataset with skills and categories",
            },
            "onet": {
                "url": "https://www.onetcenter.org/db_releases.html",
                "description": "O*NET occupational database",
            },
            "jobs": {
                "url": "https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description",
                "description": "Jobs and job descriptions dataset",
            },
        }

    def load_resume_dataset(self) -> pd.DataFrame:
        """
        Load resume dataset for skill extraction training
        Note: In production, you would download from Kaggle API
        For now, we'll create a sample dataset based on common patterns
        """
        logger.info("Loading resume dataset...")

        # Sample resume data based on common patterns from the dataset
        sample_resumes = [
            {
                "Category": "Data Science",
                "Resume": """John Doe
                Data Scientist with 3 years experience
                Skills: Python, Machine Learning, TensorFlow, Pandas, SQL, Tableau
                Education: MS in Computer Science
                Projects: Predictive Analytics, Customer Segmentation, NLP Chatbot
                Experience: Data Scientist at Tech Corp (2021-2024)
                """,
                "skills": [
                    "Python",
                    "Machine Learning",
                    "TensorFlow",
                    "Pandas",
                    "SQL",
                    "Tableau",
                ],
            },
            {
                "Category": "Web Development",
                "Resume": """Jane Smith
                Full Stack Developer
                Skills: JavaScript, React, Node.js, MongoDB, HTML, CSS, Git
                Education: BS in Software Engineering
                Projects: E-commerce Platform, Social Media App, Portfolio Website
                Experience: Frontend Developer (2 years), Full Stack Developer (1 year)
                """,
                "skills": [
                    "JavaScript",
                    "React",
                    "Node.js",
                    "MongoDB",
                    "HTML",
                    "CSS",
                    "Git",
                ],
            },
            {
                "Category": "DevOps",
                "Resume": """Mike Johnson
                DevOps Engineer
                Skills: AWS, Docker, Kubernetes, Jenkins, Python, Linux, Terraform
                Education: BS in Information Technology
                Projects: CI/CD Pipeline, Infrastructure Automation, Monitoring System
                Experience: Senior DevOps Engineer with 5+ years experience
                """,
                "skills": [
                    "AWS",
                    "Docker",
                    "Kubernetes",
                    "Jenkins",
                    "Python",
                    "Linux",
                    "Terraform",
                ],
            },
            {
                "Category": "Mobile Development",
                "Resume": """Sarah Wilson
                Mobile App Developer
                Skills: React Native, Flutter, iOS, Android, Swift, Kotlin, Firebase
                Education: MS in Mobile Computing
                Projects: Food Delivery App, Fitness Tracker, Social Network App
                Experience: Mobile Developer at StartupXYZ (3 years)
                """,
                "skills": [
                    "React Native",
                    "Flutter",
                    "iOS",
                    "Android",
                    "Swift",
                    "Kotlin",
                    "Firebase",
                ],
            },
        ]

        return pd.DataFrame(sample_resumes)

    def load_onet_skills(self) -> Dict[str, List[str]]:
        """
        Load O*NET skills taxonomy
        Note: In production, you would download from O*NET database
        Creating sample based on O*NET structure
        """
        logger.info("Loading O*NET skills taxonomy...")

        onet_skills = {
            "Software Developers": [
                "Programming",
                "Software Development",
                "Object-Oriented Programming",
                "Database Management",
                "Web Development",
                "Mobile Development",
                "Version Control",
                "Testing",
                "Debugging",
                "API Development",
            ],
            "Data Scientists": [
                "Statistical Analysis",
                "Machine Learning",
                "Data Mining",
                "Python",
                "R Programming",
                "SQL",
                "Data Visualization",
                "Big Data",
                "Predictive Modeling",
            ],
            "Web Developers": [
                "HTML",
                "CSS",
                "JavaScript",
                "Frontend Frameworks",
                "Backend Development",
                "Database Integration",
                "Responsive Design",
                "User Experience",
                "SEO",
            ],
            "DevOps Engineers": [
                "Cloud Computing",
                "Containerization",
                "Infrastructure as Code",
                "CI/CD",
                "Monitoring",
                "Security",
                "Automation",
                "Linux Administration",
            ],
            "Mobile Developers": [
                "iOS Development",
                "Android Development",
                "Cross-platform Development",
                "Mobile UI/UX",
                "App Store Optimization",
                "Mobile Security",
                "Performance Optimization",
            ],
        }

        return onet_skills

    def load_job_descriptions(self) -> pd.DataFrame:
        """
        Load job descriptions dataset
        Note: In production, you would download from Kaggle
        Creating sample based on common job posting patterns
        """
        logger.info("Loading job descriptions dataset...")

        sample_jobs = [
            {
                "Job Title": "Senior Software Engineer",
                "Company": "Tech Corp",
                "Job Description": """
                We are looking for a Senior Software Engineer to join our team.
                
                Requirements:
                • 5+ years of software development experience
                • Proficiency in Python, Java, or C++
                • Experience with cloud platforms (AWS, Azure, GCP)
                • Knowledge of microservices architecture
                • Strong problem-solving skills
                
                Tech Stack: Python, Django, PostgreSQL, Docker, Kubernetes, AWS
                """,
                "required_skills": [
                    "Python",
                    "Java",
                    "C++",
                    "AWS",
                    "Azure",
                    "GCP",
                    "Docker",
                    "Kubernetes",
                    "PostgreSQL",
                    "Django",
                ],
                "experience_level": "Senior (5+ years)",
            },
            {
                "Job Title": "Frontend Developer",
                "Company": "StartupXYZ",
                "Job Description": """
                Join our frontend team to build amazing user experiences.
                
                Requirements:
                • 2-3 years of frontend development experience
                • Expert knowledge of React and JavaScript
                • Experience with modern CSS frameworks
                • Understanding of responsive design principles
                • Familiarity with version control (Git)
                
                Tech Stack: React, TypeScript, Tailwind CSS, Next.js, GraphQL
                """,
                "required_skills": [
                    "React",
                    "JavaScript",
                    "TypeScript",
                    "CSS",
                    "HTML",
                    "Git",
                    "Next.js",
                    "GraphQL",
                ],
                "experience_level": "Mid-level (2-3 years)",
            },
            {
                "Job Title": "Data Scientist",
                "Company": "Analytics Inc",
                "Job Description": """
                We're seeking a Data Scientist to drive insights from our data.
                
                Requirements:
                • MS/PhD in Data Science, Statistics, or related field
                • 3+ years of experience in machine learning
                • Proficiency in Python and R
                • Experience with TensorFlow or PyTorch
                • Strong statistical analysis skills
                
                Tech Stack: Python, R, TensorFlow, Pandas, Jupyter, SQL, Tableau
                """,
                "required_skills": [
                    "Python",
                    "R",
                    "Machine Learning",
                    "TensorFlow",
                    "PyTorch",
                    "Pandas",
                    "SQL",
                    "Statistics",
                    "Tableau",
                ],
                "experience_level": "Mid to Senior (3+ years)",
            },
            {
                "Job Title": "DevOps Engineer",
                "Company": "Cloud Solutions",
                "Job Description": """
                Looking for a DevOps Engineer to manage our infrastructure.
                
                Requirements:
                • 4+ years of DevOps experience
                • Expertise in AWS or Azure
                • Experience with Docker and Kubernetes
                • Knowledge of Infrastructure as Code (Terraform)
                • CI/CD pipeline experience
                
                Tech Stack: AWS, Docker, Kubernetes, Terraform, Jenkins, Python, Linux
                """,
                "required_skills": [
                    "AWS",
                    "Azure",
                    "Docker",
                    "Kubernetes",
                    "Terraform",
                    "Jenkins",
                    "Python",
                    "Linux",
                    "CI/CD",
                ],
                "experience_level": "Senior (4+ years)",
            },
        ]

        return pd.DataFrame(sample_jobs)

    def get_skill_frequency_analysis(self) -> Dict[str, int]:
        """Analyze skill frequency across datasets"""
        logger.info("Performing skill frequency analysis...")

        # Load datasets
        resumes_df = self.load_resume_dataset()
        jobs_df = self.load_job_descriptions()

        skill_counts = {}

        # Count skills from resumes
        for _, row in resumes_df.iterrows():
            for skill in row["skills"]:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1

        # Count skills from job descriptions
        for _, row in jobs_df.iterrows():
            for skill in row["required_skills"]:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1

        # Sort by frequency
        sorted_skills = dict(
            sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)
        )

        logger.info(f"Analyzed {len(sorted_skills)} unique skills")
        return sorted_skills

    def get_skill_cooccurrence_matrix(self) -> pd.DataFrame:
        """Generate skill co-occurrence matrix for dependency analysis"""
        logger.info("Generating skill co-occurrence matrix...")

        resumes_df = self.load_resume_dataset()
        jobs_df = self.load_job_descriptions()

        # Collect all skill combinations
        all_skills = set()
        skill_combinations = []

        # From resumes
        for _, row in resumes_df.iterrows():
            skills = row["skills"]
            all_skills.update(skills)
            skill_combinations.append(skills)

        # From job descriptions
        for _, row in jobs_df.iterrows():
            skills = row["required_skills"]
            all_skills.update(skills)
            skill_combinations.append(skills)

        # Create co-occurrence matrix
        all_skills = sorted(list(all_skills))
        cooccurrence_matrix = pd.DataFrame(0, index=all_skills, columns=all_skills)

        for skills in skill_combinations:
            for i, skill1 in enumerate(skills):
                for j, skill2 in enumerate(skills):
                    if i != j and skill1 in all_skills and skill2 in all_skills:
                        cooccurrence_matrix.loc[skill1, skill2] += 1

        logger.info(
            f"Generated {len(all_skills)}x{len(all_skills)} co-occurrence matrix"
        )
        return cooccurrence_matrix

    def export_training_data(self, output_dir: str = "data/processed"):
        """Export processed data for model training"""
        os.makedirs(output_dir, exist_ok=True)

        logger.info("Exporting training data...")

        # Export datasets
        resumes_df = self.load_resume_dataset()
        jobs_df = self.load_job_descriptions()
        onet_skills = self.load_onet_skills()
        skill_freq = self.get_skill_frequency_analysis()
        cooccurrence_matrix = self.get_skill_cooccurrence_matrix()

        # Save to files
        resumes_df.to_csv(f"{output_dir}/resumes.csv", index=False)
        jobs_df.to_csv(f"{output_dir}/job_descriptions.csv", index=False)

        # Save skill data as JSON
        import json

        with open(f"{output_dir}/onet_skills.json", "w") as f:
            json.dump(onet_skills, f, indent=2)

        with open(f"{output_dir}/skill_frequency.json", "w") as f:
            json.dump(skill_freq, f, indent=2)

        cooccurrence_matrix.to_csv(f"{output_dir}/skill_cooccurrence.csv")

        logger.info(f"Training data exported to {output_dir}")

        return {
            "resumes": len(resumes_df),
            "job_descriptions": len(jobs_df),
            "unique_skills": len(skill_freq),
            "skill_categories": len(onet_skills),
        }


if __name__ == "__main__":
    # Example usage
    loader = DatasetLoader()
    stats = loader.export_training_data()
    print("Dataset loading completed:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
