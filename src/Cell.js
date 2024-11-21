import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, ButtonGroup, Toast, Modal } from 'react-bootstrap';
import HTMLReactParser from 'html-react-parser'; 
import beautify from 'js-beautify';
import AceEditor from 'react-ace'; 
import 'ace-builds/src-noconflict/mode-javascript'; 
import 'ace-builds/src-noconflict/theme-monokai';   
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-error_marker';
import 'ace-builds/src-noconflict/ext-emmet';
import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/webpack-resolver';


const print = (...args) => { console.log(...args); };

const Cell = (props) => {
    const { id, onClose, onUp, onDown, onChange } = props;
    
    const mystate = {
        id: "id" in props ? props.id : 0,
        name: "name" in props ? props.name : `Untitled/${id}`,
        code: "code" in props ? props.code : "",
        output: "output" in props ? props.output : "",
        console: "console" in props ? props.console : "",
        help: "help" in props ? props.help : false,
    };

    const [name, setName] = useState(mystate.name);
    const [code, setCode] = useState(mystate.code);
    const [output, setOutput] = useState(mystate.output);
    const [console, setConsole] = useState(mystate.console);
    const [help, setHelp] = useState(mystate.help);
    const [mode, setMode] = useState("javascript");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const form = useRef(null);

    useEffect(() => {
        onChange({ id, name, code, output, console, help });
    }, [code, output, console]);

    const up = onUp;
    const down = onDown;
    const close = onClose;

    const saveToLocalStorage = () => {
        const programName = prompt("プログラムの名前を入力してください:");
        if (programName) {
            localStorage.setItem(programName, code);
            alert("プログラムが保存されました！");
        }
    };

    const loadFromLocalStorage = () => {
        const programName = prompt("読み込みたいプログラムの名前を入力してください:");
        const savedCode = localStorage.getItem(programName);
        if (savedCode) {
            setCode(savedCode);
            alert("プログラムがロードされました！");
        } else {
            alert("指定されたプログラムが見つかりません。");
        }
    };

    const listLocalStorage = () => {
        const keys = Object.keys(localStorage);
        if (keys.length === 0) {
            alert("保存されたプログラムがありません。");
        } else {
            alert("保存されているプログラム一覧:\n" + keys.join("\n"));
        }
    };

    const deleteSelectedProgram = () => {
        const programName = prompt("削除したいプログラムの名前を入力してください:");
        if (programName && localStorage.getItem(programName)) {
            localStorage.removeItem(programName);
            alert(`プログラム "${programName}" が削除されました！`);
        } else {
            alert("指定されたプログラムが見つかりません。");
        }
    };

    const deleteFromLocalStorage = () => {
        localStorage.removeItem("savedProgram");
        alert("プログラムが削除されました！");
    };

    const run = () => {
        if (mode === "javascript") {
            let vcon = {
                buffer: "",
                log: function (...args) {
                    this.buffer = this.buffer + args.join(' ').split('\n').join('<br/>') + '<br/>';
                    return this;
                },
                flush: function () {
                    return new Promise((resolve) => {
                        setConsole((ps) => {
                            const updated = ps + this.buffer;
                            print(updated);
                            resolve(updated);  
                            return updated;
                        });
                        this.buffer = "";
                    });
                
                },
                clear: function () {
                    setConsole(() => "");
                    this.buffer = "";
                    return this;
                },
            };
        
            try {
                var f = new Function("console", code);
                let out = f(vcon);
        
                vcon.flush().then(() => {
                    setOutput(() => out);  
                });
        
            } catch (e) {
                setOutput(() => e.message);
            }
        } else if (mode == "html") {
            setOutput(code);
        }
    };
    const toggleHelp = () => {
        print(help);
        setHelp((ps) => !ps);
    };

    const openInBrowser = () => {
        if (!code.trim()) {
            alert("HTMLコードが入力されていません。");
            return;
        }
    
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
    
        const newWindow = window.open(url, '_blank');
    
        if (!newWindow) {
            alert("ブラウザのポップアップがブロックされました。許可してください。");
        }

        newWindow.onload = () => URL.revokeObjectURL(url);
    };
    
    const insert_text = (text) => {
        const editor = form.current.querySelector('.ace_editor').env.editor; 
        const cursorPosition = editor.getCursorPosition(); 
        editor.session.insert(cursorPosition, text); 
        editor.focus(); 
    };

    const handleShowModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleInsert = (code) => {
        insert_text(code);
        handleCloseModal();
    };
            
    const insert_tab = () => {
        insert_text('\t');
    };
 
    const notInplementedYet = () => {
        alert("Not implemented yet");
    };

    const removeBlankLines = () => {
        const newCode = code.replace(/^\s*$(?:\r\n?|\n)/gm, ""); 
        setCode(newCode);
    };

    const insertSavedCode = () => {
        const programName = prompt("挿入したいプログラムの名前を入力してください:");
        const savedCode = localStorage.getItem(programName);
        if (savedCode) {
            insert_text(savedCode); 
            alert("保存済みコードが挿入されました！");
        } else {
            alert("指定されたプログラムが見つかりません。");
        }
    };

    const formatCode = () => {
        const formattedCode = beautify.js(code, { indent_size: 2 }); 
        setCode(formattedCode);
    };

    return (
        <Form id={id} key={id} ref={form}>
            <Toast show={help} onClose={toggleHelp}>
                <Toast.Header>
                    <strong className="me-auto">
                        <span className="material-symbols-outlined">help</span> Help
                    </strong>
                </Toast.Header>
                <Toast.Body>
                    <p>
                        <span className="material-symbols-outlined">folder</span> File menu contains:
                        <ul>
                            <li>list - show the list of codes</li>
                            <li>save - save the code</li>
                            <li>delete - delete a code</li>
                            <li>delete all - delete all codes</li>
                            <li>libraries - download all codes</li>
                        </ul>
                    </p>
                    <p>
                        <span className="material-symbols-outlined">start</span> runs the code.
                    </p>
                    <p>
                        <span className="material-symbols-outlined">open_in_browser</span> opens as a document.
                    </p>
                    <p>
                        <span className="material-symbols-outlined">help</span> show this help.
                    </p>
                </Toast.Body>
            </Toast>

            <Form.Group>
                <Form.Label>
                    <Dropdown as={ButtonGroup} variant="primary" size="sm">
                        <Dropdown.Toggle>
                            <span className="material-symbols-outlined">folder</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={notInplementedYet}>tenant</Dropdown.Item>
                            <Dropdown.Item onClick={listLocalStorage}>list</Dropdown.Item>
                            <Dropdown.Item onClick={loadFromLocalStorage}>load</Dropdown.Item>
                            <Dropdown.Item onClick={saveToLocalStorage}>save</Dropdown.Item>
                            <Dropdown.Item onClick={deleteSelectedProgram}>delete</Dropdown.Item>
                            <Dropdown.Item onClick={deleteFromLocalStorage}>delete all</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>   

                    <Button variant="primary" size="sm" onClick={run}>
                        <span className="material-symbols-outlined">start</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={openInBrowser}>
                        <span className="material-symbols-outlined">open_in_browser</span>
                    </Button>
                    <Dropdown as={ButtonGroup} variant="primary" size="sm">
                        <Dropdown.Toggle>
                            <span class="material-symbols-outlined">
                                edit
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={removeBlankLines}>remove blank lines</Dropdown.Item>
                            <Dropdown.Item onClick={insertSavedCode}>insert a saved code</Dropdown.Item>
                            <Dropdown.Item onClick={formatCode}>format js code</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown as={ButtonGroup} variant="primary" size="sm">
                        <Dropdown.Toggle>
                            <span class="material-symbols-outlined">
                                clear_all
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => {setCode((ps) => "")}}>code</Dropdown.Item>
                            <Dropdown.Item onClick={() => {setOutput((ps) => "")}}>output</Dropdown.Item>
                            <Dropdown.Item onClick={() => {setConsole((ps) => "")}}>console</Dropdown.Item>
                            <Dropdown.Item onClick={() => {setCode((ps) => "");setOutput((ps) => "");setConsole((ps) => "")}}>all</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    
                    <Dropdown as={ButtonGroup} variant="secondary" size="sm">
                        <Dropdown.Toggle>
                            <span class="material-symbols-outlined">
                                javascript
                            </span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => insert_text('return ')}>
                                return
                            </Dropdown.Item>
                            <Dropdown.Item
                            onClick={() => {
                                const variableName = prompt("Enter variable name:");
                                if (variableName) {
                                    const loopLimit = prompt("Enter loop limit:");
                                    if (loopLimit) {
                                        const code = `for (let ${variableName} = 0; ${variableName} < ${loopLimit}; ${variableName}++) {\n  \n}\n`;
                                        insert_text(code);
                                    }
                                }
                            }}
                            >
                                for
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleShowModal('if')}>
                                if
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleShowModal('operator')}>
                                operator
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleShowModal('syntax')}>
                                syntax
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleShowModal('snippet')}>
                                snippet
                            </Dropdown.Item>
                        </Dropdown.Menu>

                        
                        <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                        <Modal.Title>Select Option</Modal.Title>
                        </Modal.Header>
                            <Modal.Body>
                                {modalType === 'if' && (
                                    <>
                                        <Button variant="primary" onClick={() => handleInsert('if () {\n  \n}\n')} className="m-2">
                                            if
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleInsert('else if () {\n  \n}\n')} className="m-2">
                                            else if
                                        </Button>
                                        <Button variant="danger" onClick={() => handleInsert('else {\n  \n}\n')} className="m-2">
                                            else
                                        </Button>
                                    </>
                                )}
                                {modalType === 'operator' && (
                                    <>
                                        <Button variant="primary" onClick={() => handleInsert('+')} className="m-2">
                                            +
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleInsert('-')} className="m-2">
                                            -
                                        </Button>
                                        <Button variant="danger" onClick={() => handleInsert('*')} className="m-2">
                                            *
                                        </Button>
                                        <Button variant="info" onClick={() => handleInsert('/')} className="m-2">
                                            /
                                        </Button>
                                    </>
                                )}
                                {modalType === 'syntax' && (
                                    <>
                                        <Button variant="primary" onClick={() => handleInsert('for (let i = 0; i < 10; i++) {\n  \n}\n')} className="m-2">
                                            for loop
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleInsert('while () {\n  \n}\n')} className="m-2">
                                            while loop
                                        </Button>
                                        <Button variant="danger" onClick={() => handleInsert('switch(expression) {\n  case x:\n    // code\n    break;\n  default:\n    // code\n}\n')} className="m-2">
                                            switch
                                        </Button>
                                    </>
                                )}
                                {modalType === 'snippet' && (
                                    <>
                                        <Button variant="primary" onClick={() => handleInsert('console.log("Hello, World!");')} className="m-2">
                                            console.log
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleInsert('document.getElementById("myElement");')} className="m-2">
                                            getElementById
                                        </Button>
                                        <Button variant="danger" onClick={() => handleInsert('setTimeout(() => {\n  \n}, 1000);')} className="m-2">
                                            setTimeout
                                        </Button>
                                    </>
                                )}
                            </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Dropdown>
    


                    

                    <Dropdown as={ButtonGroup} variant="secondary" size="sm">
                        <Dropdown.Toggle >
                        <span class="material-symbols-outlined">
                             List 
                            </span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setMode("javascript")}>JavaScript</Dropdown.Item>
                            <Dropdown.Item onClick={() => setMode("html")}>HTML</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Button variant="secondary" size="sm" onClick={insert_tab}>
                        <span class="material-symbols-outlined">
                            keyboard_tab
                        </span>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={notInplementedYet}>
                        <span class="material-symbols-outlined">
                            keyboard_return
                        </span>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={up}>
                        <span class="material-symbols-outlined">
                            move_up
                        </span>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={down}>
                        <span class="material-symbols-outlined">
                            move_down
                        </span>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={close}>
                        <span class="material-symbols-outlined">
                            delete
                        </span>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={toggleHelp}>
                        <span class="material-symbols-outlined">
                            help
                        </span>
                    </Button>
                </Form.Label>
            </Form.Group>
            <Form.Group className="mb-3" controlId={"grp-" + id + ".code"}>
                <Form.Label>code</Form.Label>
                <AceEditor
                    mode={mode}          
                    theme="monokai"           
                    name={id + ".code"}
                    onChange={(newCode) => setCode(newCode)}  
                    value={code}              
                    editorProps={{ $blockScrolling: true }}
                    width="100%"              
                    height="300px"            
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId={"grp-" + id + ".output"}>
                <Form.Label>output</Form.Label>
                <div id={id + ".output"} name="output">{HTMLReactParser(`${output}`)}</div>
            </Form.Group>

            <Form.Group>
                <Form.Label>console</Form.Label>
                <div id={id + ".console"} name="console">{HTMLReactParser(`${console}`)}</div>
            </Form.Group>
        </Form>
    );
};

export default Cell;