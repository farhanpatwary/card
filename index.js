const app = require('./app')

const port = process.env.PORT || 8000;
app.get('/status', (req,res)=>{
	res.status(200).send('Server Online')
})
app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
})