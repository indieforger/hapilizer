'use strict';
const Hoek = require('hoek');
const Mongoose = require('mongoose');
const Joi = require('joi');

const schema = Joi.object({
	host: Joi.string(),
	port: Joi.number(),
	db: Joi.string(),
	username: Joi.string().empty(''),
	password: Joi.string().empty('')
});
const defaults = {
	host: '127.0.0.1',
	port: 27017,
	db: 'Hapilizer',
	username: '',
	password: ''
};

exports.register = function (server, options, next) {
	const validation = Joi.validate(options, schema);
	if (validation.error) return next(validation.error);

	const connection = Mongoose.connection;
	const settings = Hoek.applyToDefaults(defaults, options);

	// setup handlers
	connection.once('open', () => next());
	connection.once('error', (error) => next(error));
	connection.once('disconnected', () => connection.removeAllListeners('error'));

	// generate credentials
	let credentials = '';
	if (settings.username !== '' && settings.password !== '') {
		credentials = settings.username + ':' + settings.password + '@';
	}
	let connectionURI = 'mongodb://' + credentials + settings.host + ':' + settings.port + '/' + settings.db;

	// connect to database
	Mongoose.connect(connectionURI);
};

exports.register.attributes = {
	name: 'Mongoose'
};