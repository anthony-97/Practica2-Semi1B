let aws_keys = {
    dynamodb: {
        region: '',
        credentials:{
            accessKeyId: "",
            secretAccessKey: ""
        }    
    },
    s3: {
        region: '', // se coloca la region del bucket 
        accessKeyId: '',
        secretAccessKey: ''
    },
    rekognition: {
        region: '',
        accessKeyId: "",
        secretAccessKey: ""
    }
}
module.exports = aws_keys
