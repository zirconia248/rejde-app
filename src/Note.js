import React, { useState } from 'react';
import { Accordion, Button, Toast, Container, Row, Col, Nav } from 'react-bootstrap';
import Cell from './Cell'; 

const Note = (props) => {
  const initial_state = { counter: 0, cells: [] };
  const { id } = props;
  const [cells, setCells] = useState("cells" in props ? props.cells : initial_state.cells);
  const [counter, setCounter] = useState("counter" in props ? props.counter : initial_state.counter);
  const [help, setHelp] = useState(false);

  const addCell = (cell) => {
    setCells((cells) => [...cells, cell]);
  };

  const delCell = (cell_id) => {
    setCells((ns) => ns.filter((cell) => cell.id !== cell_id));
  };

  const addNewCell = () => {
    let cell_id = [id, counter].join(".");
    let cell_name = `Untitled/${cell_id}`;
    addCell({ id: cell_id, name: cell_name, code: "" });
    setCounter((c) => c + 1);
  };

  const moveDown = (cell_id) => {
    setCells((ps) => {
      let ns = [...ps];
      let index = ps.findIndex((cell) => cell.id === cell_id);
      if (index >= 0 && index < ns.length - 1) {
        let tmp = ns[index];
        ns[index] = ns[index + 1];
        ns[index + 1] = tmp;
      }
      return ns;
    });
  };

  const moveUp = (cell_id) => {
    setCells((ns) => {
      let index = ns.findIndex((cell) => cell.id === cell_id);
      if (index >= 1 && index < ns.length) {
        return ns.slice(0, index - 1).concat([ns[index], ns[index - 1]]).concat(ns.slice(index + 1));
      }
      return ns;
    });
  };

  const update = (cell, index) => {
    setCells((ps) => {
      let ns = [...ps];
      ns[index] = cell;
      return ns;
    });
  };

  const toggleHelp = () => {
    setHelp((ps) => !help);
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Accordion alwaysOpen>
            {cells.map((cell, index) => (
              <Accordion.Item eventKey={cell.id} key={cell.id}>
                <Accordion.Header>{cell.name}</Accordion.Header>
                <Accordion.Body>
                  <Cell
                    id={cell.id}
                    key={cell.id}
                    name={cell.name}
                    code={cell.code}
                    onUp={() => moveUp(cell.id)}
                    onDown={() => moveDown(cell.id)}
                    onClose={() => delCell(cell.id)}
                    onChange={(c) => update(c, index)}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
      <Row>
        <Col>
          <Nav>
            <Nav.Item onClick={addNewCell}>
              <Nav.Link>
                <span className="material-symbols-outlined">add_box</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item onClick={toggleHelp}>
              <Nav.Link>
                <span className="material-symbols-outlined">help</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Toast show={help} onClose={toggleHelp}>
            <Toast.Header>
              <strong className="me-auto">
                <span className="material-symbols-outlined">help</span> Help
              </strong>
            </Toast.Header>
            <Toast.Body>
              <p>
                <span className="material-symbols-outlined">add_box</span> creates new cell.
              </p>
              <p>
                <span className="material-symbols-outlined">help</span> show this help.
              </p>
            </Toast.Body>
          </Toast>
        </Col>
      </Row>
    </Container>
  );
};

export default Note;