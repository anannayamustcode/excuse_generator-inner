import React from 'react';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface AboutProps {}

const About: React.FC<AboutProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1 style={{ marginLeft: -16 }}>Welcome</h1>
            <h3>I'm Anannaya Agarwal</h3>
            <br />
            <div className="text-block">
                <p>
                    I'm a Software Developer pursuing my B.E. in Computer Engineering at Pune Institute of Computer Technology (PICT), Pune.
                </p>
                <br />
                <p>
                    It all started when I wanted to make my sister a birthday gift. So I made her a website: {' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://anannayamustcode.github.io/Project15/"
                    >
                        this website (Project15)
                    </a>{' '}
                    actually.
                </p>
                <br />
                <p>
                    Turns out, I love coding. I chose engineering because I love math — and while there's not a ton of math here, it's still the coolest thing ever. This field might just be the most random one out there. Like what is:{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://theuselessweb.com/"
                    >
                        https://theuselessweb.com/
                    </a>
                    . I love making stuff like that. Unfortunately. And fortunately.
                </p>
                <br />
                <p>
                    <i>
                        "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race. And the human race is filled with passion"
                    </i>
                </p>
                <p>
                    <b>- Dead Poets Society</b>
                </p>
            </div>
            <ResumeDownload />
            <div className="text-block">
                <h3>Education</h3>
                <br />
                <p>
                    <b>Pune Institute of Computer Technology, Pune, Maharashtra</b>
                    <br />
                    B.E. in Computer Engineering (2023 – 2027) | CGPA: 8.314
                </p>
                <br />
                <p>
                    <b>Delhi Public School, Navi Mumbai</b>
                    <br />
                    12th Grade (CBSE, 2021 – 2023) | 91.2%
                </p>
                <br />
                <p>
                    <b>Podar International School, Navi Mumbai</b>
                    <br />
                    10th Grade (CBSE, 2011 – 2021) | 91%
                </p>
            </div>
            <div className="text-block">
                <h3>Achievements</h3>
                <br />
                <ul>
                    <li>
                        <p>
                            <b>IIIT Hyderabad Coding Contest:</b> Ranked 6th among 2000+ national participants.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>IEEE TechSangham 2025:</b> Achieved Top 10 rank among nationwide teams.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Techfiesta Finalist:</b> Built safety solution for women and children; selected for final pitching.
                        </p>
                    </li>
                </ul>
            </div>
            <div className="text-block">
                <h3>Extracurricular Activities</h3>
                <br />
                <ul>
                    <li>
                        <p>
                            <b>Domain Coordinator – Computer Networks (Impetus):</b> Managed 100+ students, designed mentorship and evaluation flow for PICT's tech fest.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>NSS Member:</b> Taught students in rural Maharashtra using visual learning methods.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>PASC – Marketing & Sponsorship Team:</b> Secured key sponsorships and elevated event reach by 40%.
                        </p>
                    </li>
                </ul>
            </div>
            <div className="text-block">
                <p>
                    If you have any questions or comments, feel free to reach out using the{' '}
                    <Link to="/contact">contact page</Link> or send an email to{' '}
                    <a href="mailto:anannayaagarwal@gmail.com">
                        anannayaagarwal@gmail.com
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default About;
