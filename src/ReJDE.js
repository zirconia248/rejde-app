import React, { useState } from 'react';
import { Navbar, Nav, Container, Row, Col, Accordion, Button, ListGroup, Tabs, Tab, Toast } from 'react-bootstrap';
import Note from './Note'; 

const ReJDE = () => {
  const state = { counter: 0, notes: [] };
  const [notes, setNotes] = useState(state.notes);
  const [counter, setCounter] = useState(state.counter);
  const [tab, setTab] = useState(null); 
  const [help, setHelp] = useState(false);

  const addNote = (note) => {
    setNotes((ns) => [...ns, note]);
  };

  const delNote = (note_id) => {
    setNotes((ns) => ns.filter((note) => note.id !== note_id));
  };

  const addNewNote = () => {
    addNote({ id: counter, cells: [] });
    setCounter((c) => c + 1);
  };

  const moveDown = (note_id) => {
    setNotes((ns) => {
      let index = ns.findIndex((note) => note.id === note_id);
      if (index >= 0 && index < ns.length - 1) {
        return ns
          .slice(0, index)
          .concat([ns[index + 1], ns[index]])
          .concat(ns.slice(index + 2));
      }
      return ns;
    });
  };

  const moveUp = (note_id) => {
    setNotes((ns) => {
      let index = ns.findIndex((note) => note.id === note_id);
      if (index >= 1 && index < ns.length) {
        return ns
          .slice(0, index - 1)
          .concat([ns[index], ns[index - 1]])
          .concat(ns.slice(index + 1));
      }
      return ns;
    });
  };

  const moveLeft = () => {
    moveUp(tab);
  };

  const moveRight = () => {
    moveDown(tab);
  };

  const remove = () => {
    delNote(tab);
  };

  const toggleHelp = () => {
    setHelp((ps) => !help);
  };

  return (
    <Container fluid>
      <Row>
        <Navbar className="bg-body-tertiary">
          <Container>
            <Navbar.Brand>ReJDE</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={addNewNote}>
                  <span className="material-symbols-outlined">note_add</span>
                </Nav.Link>
                <Nav.Link onClick={moveLeft}>
                  <span className="material-symbols-outlined">move_selection_left</span>
                </Nav.Link>
                <Nav.Link onClick={moveRight}>
                  <span className="material-symbols-outlined">move_selection_right</span>
                </Nav.Link>
                <Nav.Link onClick={remove}>
                  <span className="material-symbols-outlined">remove_selection</span>
                </Nav.Link>
                <Nav.Link onClick={toggleHelp}>
                  <span className="material-symbols-outlined">help</span>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </Row>
      <Row>
        <Col>
          <Toast show={help} onClose={toggleHelp}>
            <Toast.Header>
              <strong className="me-auto">
                <span className="material-symbols-outlined">help</span> Help
              </strong>
            </Toast.Header>
            <Toast.Body>
              <p>
                <span className="material-symbols-outlined">note_add</span> creates new note.
              </p>
              <p>
                <span className="material-symbols-outlined">move_selection_left</span> moves the selected note to left.
              </p>
              <p>
                <span className="material-symbols-outlined">move_selection_right</span> moves the selected note to right.
              </p>
              <p>
                <span className="material-symbols-outlined">remove_selection</span> removes the selected note.
              </p>
              <p>
                <span className="material-symbols-outlined">help</span> show this help.
              </p>
            </Toast.Body>
          </Toast>
          <Tabs onSelect={(k) => setTab(k)}>
            {notes.map((note) => (
              <Tab eventKey={note.id} title={'#' + note.id} key={note.id}>
                <Note id={note.id} cells={note.cells} />
              </Tab>
            ))}
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ReJDE;