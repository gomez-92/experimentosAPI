import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

class Connect{

	static #instance;

	constructor(){
		mongoose.connect(process.env.URL_MONGO);
	};

	static getInstance = () => {
		if(this.#instance){
			console.log('Already connected!');
			return this.#instance;
		}
		this.#instance = new Connect();
		console.log('Connected!');
		return this.#instance;
	}
}

export default Connect;
