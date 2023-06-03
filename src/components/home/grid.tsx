import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'


export const PatientInfo = (/*(props: any)*/) => {

    const patientData = new Map();
    patientData.set('heartRate', 80);
    patientData.set('respirationRate', 20);
    patientData.set('stressLevel', 5);
    patientData.set('spO2', 98);
    patientData.set('comment', "Carefully");

    //props = patientData;
    const props = patientData

    const fontStyle = {
        fontSize: '15px',
        fontWeight: 'bold',
    };

    return (
        <Container>
        <Row>
            <Col className="text-center">
            <img src="images/ic_heart_rate.png" alt="hr" width="200" height="200"/>
            <div style={fontStyle}>Heart Rate : {props.get('heartRate')}</div>
            </Col>
            <Col className="text-center">
            <img src="images/ic_respiratory_rate.png" alt="rr" width="200" height="200"/>
            <p style={fontStyle}>Respiration Rate : {props.get('respirationRate')}</p>
            </Col>
        </Row>
        <br />
        <Row>
            <Col className="text-center">
            <img src="images/ic_stress.png" alt="stress" width="200" height="200"/>
            <p style={fontStyle}>Stress Level : {props.get('stressLevel')}</p>
            </Col>
            <Col className="text-center">
            <img src="images/ic_oxygen_saturation.png" alt="sp" width="200" height="200"/>
            <p style={fontStyle}>SpO2 : {props.get('spO2')}</p>
            </Col>
        </Row>
        <br />
        <h3 style={{fontSize: '20px', textAlign: 'center'}}>Comment : {props.get('comment')}</h3>
        </Container>
    );
};

export default PatientInfo;