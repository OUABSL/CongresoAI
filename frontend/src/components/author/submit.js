import React, { useState } from "react";
import { Form, Button } from 'react-bootstrap';

const SubmitArticle = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [keyWords, setKeyWords] = useState("");
    const [file, setFile] = useState(null);
    const token = localStorage.getItem('access_token');


    const submitForm = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('key_words', keyWords);
        if (file) {
            formData.append('latex_project', file);
        }
        let headers = new Headers();
        headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
        headers.append('Access-Control-Allow-Credentials', 'true');
        headers.append('Authorization','Bearer ' + token);

        console.log(formData)
        try {
            const response = await fetch('http://localhost:5000/submit', {
                method: 'POST',
                body: formData,
                headers: headers
                
            })
            
            const responseData = await response.json();

            if (responseData.error) {
                alert(responseData.error);
            }

            if(responseData.message) {
                alert(responseData.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Form onSubmit={submitForm}>
            <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>

            <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>

            <Form.Group>
                <Form.Label>Key Words</Form.Label>
                <Form.Control type="text" value={keyWords} onChange={(e) => setKeyWords(e.target.value)} required />
            </Form.Group>

            <Form.Group>
                <Form.Label>Latex Project</Form.Label>
                <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} required />
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    );
};

export default SubmitArticle;