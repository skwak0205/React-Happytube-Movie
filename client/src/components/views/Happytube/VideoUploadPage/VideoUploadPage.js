import React, { useState } from 'react'
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import Dropzone from 'react-dropzone';
import Axios from 'axios';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { TextArea } = Input;

const PrivateOptions = [
    {value: 0, label: "Private"},
    {value: 1, label: "Public"}
]

const CategoryOptions = [
    { value: 0, label: "Film & Animation" },
    { value: 0, label: "Autos & Vehicles" },
    { value: 0, label: "Music" },
    { value: 0, label: "Pets & Animals" },
    { value: 0, label: "Sports" }
]

function VideoUploadPage(props) {
    const user = useSelector(state => state.user);

    const [VideoTitle, setVideoTitle] = useState("");
    const [Description, setDescription] = useState("");
    const [Private, setPrivate] = useState(0);
    const [Category, setCategory] = useState("Film & Animation");
    const [FilePath, setFilePath] = useState("");
    const [Duration, setDuration] = useState("");
    const [ThumbnailPath, setThumbnailPath] = useState("");

    let src = process.env.NODE_ENV === "development"
    ? `http://localhost:5000/${ThumbnailPath}`
    : `https://react-happytube.herokuapp.com/${ThumbnailPath}`;

    const onTitleChange = (e) => {
        setVideoTitle(e.currentTarget.value)
    }

    const onDescriptionChange = (e) => {
        setDescription(e.currentTarget.value)
    }

    const onPrivateChange = (e) => {
        setPrivate(e.currentTarget.value)
    }

    const onCategoryChange = (e) => {
        setCategory(e.currentTarget.value)
    }

    const onDrop = (files) => {
        let formData = new FormData();

        const config = {
            header: { "content-type": "multipart/form-data" }
        }
        formData.append("file", files[0]);

        Axios.post('/api/video/uploadFiles', formData, config)
                .then(response => {
                    if(response.data.success) {
                        let variable = {
                            url: response.data.url,
                            fileName: response.data.fileName
                        }
                        setFilePath(response.data.url);

                        Axios.post('/api/video/thumbnail', variable)
                                .then(response => {
                                    if(response.data.success) {
                                        setDuration(response.data.fileDuration);
                                        setThumbnailPath(response.data.url);
                                    } else {
                                        alert("Failed to create a thumbnail");
                                    }
                                })
                    } else {
                        alert("Failed to upload a video");
                    }
                })
    }

    const onSubmit = (e) => {
        e.preventDefault();

        const variables = {
            writer: user.userData._id,
            title: VideoTitle,
            description: Description,
            privacy: Private,
            filePath: FilePath,
            category: Category,
            duration: Duration,
            thumbnail: ThumbnailPath
        };

        Axios.post('/api/video/uploadVideo', variables)
                .then(response => {
                    if(response.data.success) {
                        message.success('Successfully upload a video!!');

                        setTimeout(() => {
                            props.history.push('/');
                        }, 3000);
                        
                    } else {
                        alert("Failed to upload a video");
                    }
                })
    };

    const onCancel = () => {
        props.history.push('/');
    };

    return (

    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Title level={2}> Upload Video</Title>
        </div>

        <Form onSubmit={onSubmit}>
            <div style={{ display: 'flex', justifyContent:'space-between' }}>
                {/* Drop Zone */}
                <Dropzone 
                    onDrop={onDrop} 
                    multiple={false}
                    maxSize={800000000}
                >
                    {({ getRootProps, getInputProps}) => (
                        <div style=
                            {{ 
                                width: '300px', 
                                height: '240px', 
                                border:'1px solid lightgray', 
                                display:'flex', 
                                alignItems:'center', 
                                justifyContent:'center'
                            }}
                            {...getRootProps()}>

                            <input {...getInputProps()} />
                            <Icon type="plus" style={{ fontSize:'3rem'}} />
                        </div>
                    )}
                    
                </Dropzone>

                {/* Thumbnail */}
                {ThumbnailPath && 
                    <div>
                        <img src={src} alt="thumbnail" />
                    </div>
                }

            </div>

            <br />
            <br />

            <label>Title</label>
            <Input onChange={onTitleChange} value={VideoTitle} />

            <br />
            <br />

            <label>Description</label>
            <TextArea onChange={onDescriptionChange} value={Description} />

            <br />
            <br />

            <select onChange={onPrivateChange}>
                {PrivateOptions.map((item, index) => (
                    <option key={index} value={item.value}>{item.label}</option>
                ))}
            </select>

            <br />
            <br />

            <select onChange={onCategoryChange}>
                {CategoryOptions.map((item, index) => (
                    <option key={index} value={item.value}>{item.label}</option>
                ))}
            </select>

            <br />
            <br />

            <Button type="primary" size="large" onClick={onSubmit}>
                Submit
            </Button>
            
            <Button style={{ marginLeft: '10px' }} type="danger" size="large" onClick={onCancel}>
                Cancel
            </Button>
        </Form>

    </div>
    )
}

export default VideoUploadPage