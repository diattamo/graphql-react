const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const Event = require('./models/event')
const User = require('./models/user')

const app = express();

app.use(bodyParser.json());

const user = userId => {
    return User.findById(userId)
        .then(user => {
            return { 
                ...user._doc, 
                id: user.id,
                createdEvents: events.bind(this, user._doc.createdEvent)
            }
        })
        .catch(err => {
            throw err;
        })
}

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    creator: user.bind(this, event.creator)
                }
            })
        })
        .catch(
            err => {
                throw err;
            }
        )
}

app.use('/graphql', graphQlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return {
                            ...event._doc,
                            _id: event.id,
                            creator: user.bind(this, event._doc.creator)
                        };
                    })
                }).catch(err => {
                    throw err;
                });
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '5e0c7392c7fa97f976a9dd11'
            })
            let createdEvent;
            return event
                .save()
                .then(result => {
                    createdEvent = { ...result._doc, _id: result.id };
                    return User.findById('5e0c7392c7fa97f976a9dd11');
                })
                .then(user => {
                    if (!user) {
                        throw new Error('user not found')
                    }
                    user.createdEvents.push(event);
                    return user.save();
                })
                .then(result => {
                    return createdEvent;
                })
                .catch(err => {
                    console.log(err);
                })
        },
        createUser: args => {
            User.findOne({ email: args.userInput.email }).then(user => {
                if (user) {
                    throw new Error('User exists already')
                }
                return bcrypt
                    .hash(args.userInput.password, 12)
            }).then(hashedPwd => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPwd
                });
                return user.save();
            })
                .then(result => {
                    return { ...result._doc, password: null, _id: result.id }
                })
                .catch(err => {
                    throw err;
                })
        }
    },
    graphiql: true
}));



app.get('/', (req, res, next) => {
    res.send('Hello Nowew');
})


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@cluster0-sryit.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
).then(() => {
    app.listen(2000);
}).catch(err => {
    console.log(err);
});