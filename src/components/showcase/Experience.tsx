import React from 'react';
import ResumeDownload from './ResumeDownload';

export interface ExperienceProps {}

const Experience: React.FC<ExperienceProps> = (props) => {
    return (
        <div className="site-page-content">
            <ResumeDownload />
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2 style={styles.companyTitle}>WNS Global Services</h2>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Software Engineering Intern</h3>
                        <b>
                            <p>Aug 2025 – Oct 2025</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Built a real-time ASL → text/speech prototype using React, MediaPipe Holistic, and PyTorch models, optimized with FastAPI + ONNX/TorchScript for low-latency inference.
                        </p>
                    </li>
                    <li>
                        <p>
                            Implemented a full bidirectional communication pipeline, integrating Google/Gemini STT, Web Speech API TTS, and client-side landmark streaming for smooth real-time interaction.
                        </p>
                    </li>
                </ul>
            </div>

            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2 style={styles.companyTitle}>Astrophel Aerospace</h2>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={'https://www.astrophelaerospace.in/'}
                        >
                            <h4>www.astrophelaerospace.in</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Full-Stack Web Developer Intern</h3>
                        <b>
                            <p>May 2025 – Aug 2025</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Co-developed, deployed, and launched Astrophel’s official website (https://www.astrophelaerospace.in/).
                        </p>
                    </li>
                    <li>
                        <p>
                            Built with Next.js, Tailwind CSS, Node.js, and MongoDB for seamless frontend-backend integration.
                        </p>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Tech Stack & Skills</h2>
                <br />
                <ul>
                    <li>
                        <p>
                            <b>Programming Languages:</b> Python, C++, TypeScript, JavaScript, Java
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Backend & Systems:</b> FastAPI, Node.js, REST APIs, Webhooks, GitHub API
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Databases:</b> MongoDB, MySQL, Redis, Postgres
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Tools & Technologies:</b> Semgrep, OpenAI API, Docker, WebSockets
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerContainer: {
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
        marginTop: 24,
    },
    headerRow: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    companyTitle: {
        fontSize: 32,
        fontWeight: 'normal',
        lineHeight: 1.2,
        marginBottom: 4,
    },
};

export default Experience;
