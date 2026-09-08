import React from 'react';

export interface ArtProjectsProps {}

const ArtProjects: React.FC<ArtProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Art & Fun</h1>
            <h3>Endeavors</h3>
            <br />
            <div className="text-block">
                <p>
                    "Like what is: https://theuselessweb.com/. I love making stuff like that. Unfortunately. And fortunately."
                </p>
            </div>

            <div className="text-block">
                <h2>Coffee-Run</h2>
                <br />
                <p>Fun web project.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://i-have-no-idea-what-i-am-doing.vercel.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Coffee-Run
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Feed-the-cat-game</h2>
                <br />
                <p>Interactive web game.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://heartfelt-sundae-81dc33.netlify.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Feed-the-cat-game
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Voice-Activated-Maze-Game</h2>
                <br />
                <p>Interactive voice-controlled maze game.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://mellow-biscuit-82a8f1.netlify.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Voice-Activated-Maze-Game
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Piano</h2>
                <br />
                <p>Interactive web piano project.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://silly-llama-ec6eaa.netlify.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Piano
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Math-Game</h2>
                <br />
                <p>Interactive math web game.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://guess-phobia-4q4v.vercel.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Math-Game
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Overly-Complicated-Game</h2>
                <br />
                <p>An intentionally challenging web game.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://castle-jade.vercel.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - Overly-Complicated-Game
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>OneTask</h2>
                <br />
                <p>Minimalist single-task web application.</p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://onetask-blush.vercel.app/"
                        >
                            <p>
                                <b>[Live Site]</b> - OneTask
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>First-Project</h2>
                <br />
                <p>
                    The website that started my passion for coding! Built as a birthday gift for my sister.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://anannayamustcode.github.io/Project15/"
                        >
                            <p>
                                <b>[Live Site]</b> - First-Project (Project15)
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ArtProjects;
