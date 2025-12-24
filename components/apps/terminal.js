import React, { Component } from 'react'
import $ from 'jquery';
import ReactGA from 'react-ga4';

export class Terminal extends Component {
    constructor() {
        super();
        this.cursor = "";
        this.terminal_rows = 1;
        this.current_directory = "~";
        this.curr_dir_name = "root";
        this.prev_commands = [];
        this.commands_index = -1;
        this.child_directories = {
            root: ["books", "projects", "personal-documents", "skills", "languages", "interests"],
            books: ["Kannada varnamale Pusthaka", "Linux Beginner to Hero", "ML and Algorithms"],
            "personal-documents": ["resume"],
            skills: ["Cloud Infrastructure", "DevOps", "Linux", "Python", "Shell Scripting", "React", "Node.js", "Git", "Docker", "AWS", "Kubernetes", "ServiceNow", "Ansible", "Machine Learning"],
            projects: [], // Will be populated from GitHub
            interests: ["Creating chaos", "Living Alone", "Learn Linux", "Thinking that never happen"],
            languages: ["Lambani [My Community Language]", "Kannada [My Mother tongue]", "Hindi [My National Language]", "English [Which i used to earn]", "Tulu [Learnt during my Bachelors]"],
        };
        
        this.projectsLoaded = false;
        
        // Book links
        this.book_links = {
            "Kannada varnamale Pusthaka": "https://www.amazon.in/s?k=kannada+varnamale+book",
            "Linux Beginner to Hero": "https://www.amazon.in/s?k=linux+beginner+to+hero",
            "ML and Algorithms": "https://www.amazon.in/s?k=machine+learning+algorithms+book"
        };
        this.state = {
            terminal: [],
        }
    }

    componentDidMount() {
        this.reStartTerminal();
        this.fetchGitHubProjects();
    }
    
    fetchGitHubProjects = async () => {
        try {
            const response = await fetch('https://api.github.com/users/Soma7353/repos?sort=updated&per_page=20');
            if (!response.ok) throw new Error('Failed to fetch repositories');
            const repos = await response.json();
            
            const projectList = repos.map(repo => repo.name);
            this.child_directories.projects = projectList;
            this.projectsLoaded = true;
        } catch (error) {
            console.error('Error fetching GitHub repos:', error);
            // Keep default projects if fetch fails
            this.child_directories.projects = ["ubuntu-based-portfolio"];
            this.projectsLoaded = true;
        }
    }

    componentDidUpdate() {
        clearInterval(this.cursor);
        this.startCursor(this.terminal_rows - 2);
    }

    componentWillUnmount() {
        clearInterval(this.cursor);
    }

    reStartTerminal = () => {
        clearInterval(this.cursor);
        $('#terminal-body').empty();
        // Add welcome message
        const welcomeMsg = '<div class="my-2 font-normal text-gray-300">Welcome! Type <span class="text-ubt-green font-bold">ls</span> to see available commands and directories.</div>';
        $('#terminal-body').append(welcomeMsg);
        this.appendTerminalRow();
    }

    appendTerminalRow = () => {
        let terminal = this.state.terminal;
        terminal.push(this.terminalRow(this.terminal_rows));
        this.setState({ terminal });
        this.terminal_rows += 2;
    }

    terminalRow = (id) => {
        return (
            <React.Fragment key={id}>
                <div className="flex w-full h-5">
                    <div className="flex">
                        <div className=" text-ubt-green">somashekhar@Dell</div>
                        <div className="text-white mx-px font-medium">:</div>
                        <div className=" text-ubt-blue">{this.current_directory}</div>
                        <div className="text-white mx-px font-medium mr-1">$</div>
                    </div>
                    <div id="cmd" onClick={this.focusCursor} className=" bg-transperent relative flex-1 overflow-hidden">
                        <span id={`show-${id}`} className=" float-left whitespace-pre pb-1 opacity-100 font-normal tracking-wider"></span>
                        <div id={`cursor-${id}`} className=" float-left mt-1 w-1.5 h-3.5 bg-white"></div>
                        <input id={`terminal-input-${id}`} data-row-id={id} onKeyDown={this.checkKey} onBlur={this.unFocusCursor} className=" absolute top-0 left-0 w-full opacity-0 outline-none bg-transparent" spellCheck={false} autoFocus={true} autoComplete="off" type="text" />
                    </div>
                </div>
                <div id={`row-result-${id}`} className={"my-2 font-normal"}></div>
            </React.Fragment>
        );

    }

    focusCursor = (e) => {
        clearInterval(this.cursor);
        this.startCursor($(e.target).data("row-id"));
    }

    unFocusCursor = (e) => {
        this.stopCursor($(e.target).data("row-id"));
    }

    startCursor = (id) => {
        clearInterval(this.cursor);
        $(`input#terminal-input-${id}`).trigger("focus");
        // On input change, set current text in span
        $(`input#terminal-input-${id}`).on("input", function () {
            $(`#cmd span#show-${id}`).text($(this).val());
        });
        this.cursor = window.setInterval(function () {
            if ($(`#cursor-${id}`).css('visibility') === 'visible') {
                $(`#cursor-${id}`).css({ visibility: 'hidden' });
            } else {
                $(`#cursor-${id}`).css({ visibility: 'visible' });
            }
        }, 500);
    }

    stopCursor = (id) => {
        clearInterval(this.cursor);
        $(`#cursor-${id}`).css({ visibility: 'visible' });
    }

    removeCursor = (id) => {
        this.stopCursor(id);
        $(`#cursor-${id}`).css({ display: 'none' });
    }

    clearInput = (id) => {
        $(`input#terminal-input-${id}`).trigger("blur");
    }

    checkKey = (e) => {
        if (e.key === "Enter") {
            let terminal_row_id = $(e.target).data("row-id");
            let command = $(`input#terminal-input-${terminal_row_id}`).val().trim();
            if (command.length !== 0) {
                this.removeCursor(terminal_row_id);
                this.handleCommands(command, terminal_row_id);
            }
            else return;
            // push to history
            this.prev_commands.push(command);
            this.commands_index = this.prev_commands.length - 1;

            this.clearInput(terminal_row_id);
        }
        else if (e.key === "ArrowUp") {
            let prev_command;

            if (this.commands_index <= -1) prev_command = "";
            else prev_command = this.prev_commands[this.commands_index];

            let terminal_row_id = $(e.target).data("row-id");

            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);

            this.commands_index--;
        }
        else if (e.key === "ArrowDown") {
            let prev_command;

            if (this.commands_index >= this.prev_commands.length) return;
            if (this.commands_index <= -1) this.commands_index = 0;

            if (this.commands_index === this.prev_commands.length) prev_command = "";
            else prev_command = this.prev_commands[this.commands_index];

            let terminal_row_id = $(e.target).data("row-id");

            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);

            this.commands_index++;
        }
    }

    childDirectories = (parent) => {
        let files = [];
        
        if (parent === "languages") {
            files.push(`<div class="flex flex-col justify-start">`)
            const languageEmojis = {
                "Lambani [My Community Language]": "🏘️",
                "Kannada [My Mother tongue]": "🪷",
                "Hindi [My National Language]": "🇮🇳",
                "English [Which i used to earn]": "💼",
                "Tulu [Learnt during my Bachelors]": "📚"
            };
            
            this.child_directories[parent].forEach(file => {
                const emoji = languageEmojis[file] || "📖";
                files.push(
                    `<div class="font-bold mr-2 text-ubt-blue mb-1">${emoji} '${file}'</div>`
                )
            });
            files.push(`</div>`)
        } else if (parent === "books") {
            files.push(`<div class="flex flex-col justify-start">`)
            this.child_directories[parent].forEach(file => {
                const link = this.book_links[file] || "#";
                files.push(
                    `<div class="font-bold mr-2 text-ubt-blue mb-1">📚 <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-ubt-blue hover:text-ubt-green underline">'${file}'</a></div>`
                )
            });
            files.push(`</div>`)
        } else if (parent === "projects") {
            files.push(`<div class="flex flex-col justify-start">`)
            this.child_directories[parent].forEach(file => {
                const repoLink = `https://github.com/Soma7353/${file}`;
                files.push(
                    `<div class="font-bold mr-2 text-ubt-blue mb-1">💻 <a href="${repoLink}" target="_blank" rel="noopener noreferrer" class="text-ubt-blue hover:text-ubt-green underline">'${file}'</a></div>`
                )
            });
            files.push(`</div>`)
        } else if (parent === "personal-documents") {
            files.push(`<div class="flex flex-col justify-start">`)
            this.child_directories[parent].forEach(file => {
                files.push(
                    `<div class="font-bold mr-2 text-ubt-blue mb-1">📄 '${file}'</div>`
                )
            });
            files.push(`</div>`)
        } else {
            files.push(`<div class="flex justify-start flex-wrap">`)
            this.child_directories[parent].forEach(file => {
                files.push(
                    `<span class="font-bold mr-2 text-ubt-blue">'${file}'</span>`
                )
            });
            files.push(`</div>`)
        }
        return files;
    }

    closeTerminal = () => {
        $("#close-terminal").trigger('click');
    }

    handleCommands = (command, rowId) => {
        let words = command.split(' ').filter(Boolean);
        let main = words[0];
        words.shift()
        let result = "";
        let rest = words.join(" ");
        rest = rest.trim();
        switch (main) {
            case "cd":
                if (words.length === 0 || rest === "") {
                    this.current_directory = "~";
                    this.curr_dir_name = "root"
                    break;
                }
                if (words.length > 1) {
                    result = "too many arguments, arguments must be <1.";
                    break;
                }

                if (rest === "personal-documents") {
                    this.current_directory += "/" + rest;
                    this.curr_dir_name = "personal-documents";
                    break;
                }

                if (this.child_directories[this.curr_dir_name].includes(rest)) {
                    this.current_directory += "/" + rest;
                    this.curr_dir_name = rest;
                }
                else if (rest === "." || rest === ".." || rest === "../") {
                    result = "Type 'cd' to go back 😅";
                    break;
                }
                else {
                    result = `bash: cd: ${words}: No such file or directory`;
                }
                break;
            case "ls":
                let target = words[0];
                if (target === "" || target === undefined || target === null) target = this.curr_dir_name;

                if (words.length > 1) {
                    result = "too many arguments, arguments must be <1.";
                    break;
                }
                if (target in this.child_directories) {
                    result = this.childDirectories(target).join("");
                }
                else if (target === "personal-documents") {
                    result = this.childDirectories("personal-documents").join("");
                    break;
                }
                else {
                    result = `ls: cannot access '${words}': No such file or directory                    `;
                }
                break;
            case "mkdir":
                if (words[0] !== undefined && words[0] !== "") {
                    this.props.addFolder(words[0]);
                    result = "";
                } else {
                    result = "mkdir: missing operand";
                }
                break;
            case "pwd":
                let str = this.current_directory;
                result = str.replace("~", "/home/somashekhar")
                break;
            case "code":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("vscode");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands:[ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, todoist, trash, settings, sendmsg]";
                }
                break;
            case "echo":
                result = this.xss(words.join(" "));
                break;
            case "spotify":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("spotify");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "chrome":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("chrome");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "todoist":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("todo-ist");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "trash":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("trash");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "about-somashekhar":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("about-somashekhar");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "skills":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("about-somashekhar");
                    // Focus on skills section after opening
                    setTimeout(() => {
                        const skillsElement = document.getElementById("skills");
                        if (skillsElement) skillsElement.focus();
                    }, 500);
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "interests":
                if (words[0] === "." || words.length === 0) {
                    result = "My interests:<br>" +
                        "<div class='ml-4 mt-2'>" +
                        "<div class='text-ubt-green'>• Creating chaos</div>" +
                        "<div class='text-ubt-green'>• Living Alone</div>" +
                        "<div class='text-ubt-green'>• Learn Linux</div>" +
                        "<div class='text-ubt-green'>• Thinking that never happen</div>" +
                        "</div>";
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "books":
                if (words.length === 0) {
                    result = this.childDirectories("books").join("");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, books, languages, projects, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "languages":
                if (words.length === 0) {
                    result = this.childDirectories("languages").join("");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, books, languages, projects, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "projects":
                if (words.length === 0) {
                    if (this.projectsLoaded) {
                        result = this.childDirectories("projects").join("");
                    } else {
                        result = "Loading projects from GitHub...";
                        // Retry after a moment
                        setTimeout(() => {
                            if (this.projectsLoaded) {
                                const rowId = document.querySelector('[id^="row-result-"]')?.id;
                                if (rowId) {
                                    document.getElementById(rowId).innerHTML = this.childDirectories("projects").join("");
                                }
                            }
                        }, 1000);
                    }
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, books, languages, projects, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "terminal":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("terminal");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "settings":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("settings");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "sendmsg":
                if (words[0] === "." || words.length === 0) {
                    this.props.openApp("gedit");
                } else {
                    result = "Command '" + main + "' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, todoist, trash, settings, sendmsg ]";
                }
                break;
            case "help":
                result = "Type <span class='text-ubt-green font-bold'>ls</span> to see available commands and directories.<br>Type <span class='text-ubt-green font-bold'>about-somashekhar</span> to open my portfolio info.";
                break;
            case "clear":
                this.reStartTerminal();
                return;
            case "exit":
                this.closeTerminal();
                return;
            case "sudo":

                ReactGA.event({
                    category: "Sudo Access",
                    action: "lol",
                });

                result = "<img class=' w-2/5' src='./images/memes/used-sudo-command.webp' />";
                break;
            default:
                result = "Command '" + main + "' not found, or not yet implemented.<br>Type <span class='text-ubt-green font-bold'>ls</span> to see available commands and directories.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-somashekhar, skills, interests, books, languages, projects, todoist, trash, settings, sendmsg, help ]";
        }
        document.getElementById(`row-result-${rowId}`).innerHTML = result;
        this.appendTerminalRow();
    }

    xss(str) {
        if (!str) return;
        return str.split('').map(char => {
            switch (char) {
                case '&':
                    return '&amp';
                case '<':
                    return '&lt';
                case '>':
                    return '&gt';
                case '"':
                    return '&quot';
                case "'":
                    return '&#x27';
                case '/':
                    return '&#x2F';
                default:
                    return char;
            }
        }).join('');
    }

    render() {
        return (
            <div className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-bold" id="terminal-body">
                {
                    this.state.terminal
                }
            </div>
        )
    }
}

export default Terminal

export const displayTerminal = (addFolder, openApp) => {
    return <Terminal addFolder={addFolder} openApp={openApp}> </Terminal>;
}
