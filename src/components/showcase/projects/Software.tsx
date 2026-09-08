import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface SoftwareProjectsProps {}

const SoftwareProjects: React.FC<SoftwareProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Software</h1>
            <h3>Projects</h3>
            <br />
            <p>
                Below are my software development projects.
            </p>
            <br />
            <ResumeDownload />
            <br />

            <div className="text-block">
                <h2>AI PR Security Analyzer</h2>
                <br />
                <p>
                    Built a FastAPI-based GitHub webhook service to analyze pull requests for security vulnerabilities using Semgrep, custom static checks, and LLM-based reasoning. Implemented diff parsing with line-level vulnerability mapping and automated inline PR comments, along with a severity-based risk scoring system.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/anannayamustcode/ai-pr-analyzer"
                        >
                            <p>
                                <b>[GitHub]</b> - ai-pr-analyzer Repository
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Ecolens - AI Sustainability Analyzer</h2>
                <br />
                <p>
                    Analyzes images or barcodes, or web scrapes when urls are provided, and fetches data about products, creates a dashboard, calculates their ecological sustainability, and suggests products better for the environment. Built OCR+NLP pipeline (92% accuracy) and integrated Groq LLaMA + Tavily for reasoning-based eco-scoring. Full-stack Next.js + Tailwind dashboard with MongoDB for product insights.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://eco-lens-1-beta.vercel.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - eco-lens-1-beta.vercel.app
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Felecity</h2>
                <br />
                <p>
                    Frontend web project built with React and deployed on Vercel.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://felecity.vercel.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - felecity.vercel.app
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Visual Database Manager</h2>
                <br />
                <p>
                    Database project that manages databases in an interactive, visual way, built using Astro and deployed on Railway.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://database-project-production-faab.up.railway.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Visual Database Manager
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Satvik Laddoo</h2>
                <br />
                <p>
                    Website for managing a small business, deployed on Cloudflare Workers.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://satvikladdoo.mithai.workers.dev/"
                        >
                            <p>
                                <b>[Live Site]</b> - satvikladdoo.mithai.workers.dev
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Deal Insights Dashboard - AI Financial Analysis Platform</h2>
                <br />
                <p>
                    Built PDF/CSV parser for financials and integrated Google Gemini for structured deal assessment. Created interactive React dashboard for metrics, comparisons, and AI-assisted insights.
                </p>
            </div>

            <div className="text-block">
                <h2>Array of Hope</h2>
                <br />
                <p>
                    Frontend web project focused on community impact, deployed on Vercel.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://arrayofhope.vercel.app"
                        >
                            <p>
                                <b>[Live Site]</b> - arrayofhope.vercel.app
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <ResumeDownload />
        </div>
    );
};

export default SoftwareProjects;
