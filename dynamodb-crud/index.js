const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));



const config = new AWS.Config({
    accessKeyId: '', 
    secretAccessKey: '',
    region: 'ap-southeast-2'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'SanPham';
const multer = require('multer');
const upload = multer();

app.get('/', (request, response) => {
    const params = {
        TableName: tableName
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            console.log('DynamoDB Scan Error:', err);
            response.send('Internal Server Error');
        } else {
            return response.render('index', { sanPhams: data.Items });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.post('/add', upload.fields([]), (req, res) => {
  const { ma_sp, ten_sp, so_luong } = req.body;
  
  const params = {
    TableName: 'SanPham',
    Item: {
      "ma_sp": ma_sp,
      "ten_sp": ten_sp,
      "so_luong": so_luong
    }
  };

  docClient.put(params, (err, data) => {
    if (err) {
      return res.send('Internal Server Error');
    } else {
      return res.redirect('/');
    }
  });
});

app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length === 0) {
        return res.redirect('/');
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ma_sp": listItems[index]
            }
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send('Internal Server Error');
            } else {
                if (index > 0) {
                    onDeleteItem(index - 1);
                } else {
                    return res.redirect('/');
                }
            }
        });
    }

    onDeleteItem(listItems.length - 1);
});


