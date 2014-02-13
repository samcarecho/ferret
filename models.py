import endpoints
from google.appengine.ext import ndb
import json

from tf_api_messages import UserResponseMessage
from tf_api_messages import VoteResponseMessage
from tf_api_messages import TokenResponseMessage


TIME_FORMAT_STRING = '%b %d, %Y %I:%M:%S %p'


class Users(ndb.Expando):
    """
    Models app users. All users are Facebook users.
    Entity key = Facebook id
    """
    joinDate = ndb.DateTimeProperty(auto_now_add=True)
    userName = ndb.StringProperty(required=True)
    userData = ndb.JsonProperty()

    @property
    def timestamp(self):
        """Property to format a datetime object to string."""
        return self.joinDate.strftime(TIME_FORMAT_STRING)

    def to_message(self):
        """Turns the User entity into a ProtoRPC object.

        This is necessary so the entity can be returned in an API request.

        Returns:
            An instance of ScoreResponseMessage with the ID set to the datastore
            ID of the current entity, the outcome simply the entity's outcome
            value and the played value equal to the string version of played
            from the property 'timestamp'.
        """
        return UserResponseMessage(id=self.key.id(),
                                   joinDate=self.timestamp,
                                   userName=self.userName,
                                   userData=json.dumps(self.userData))

    @classmethod
    def put_from_message(cls, message):
        """Gets the current user and inserts in the datastore.

        Args:
            message: A UserRequestMessage instance to be inserted. An json formatted string retrieved from FB by the
            client side code

        Returns:
            The User entity that was inserted.
        """
        #current_user = get_endpoints_current_user()

        #Python object that will store the user data.
        user_data = json.loads(message.userData)
        user_name = user_data['name']
        user_id = int(user_data['id'])

        key = ndb.Key(Users, user_id)
        ent = key.get()
        if ent is None:
            ent = cls(id=user_id, userName=user_name, userData=user_data)
        else:
            ent.userName = user_name
            ent.userData = user_data
        ent.put()

        return ent

        #entity.get_or_insert(user_data['id'])
        #return entity

    @classmethod
    #TODO: must add FB token verification to certify that the query is not a forgery.
    # message should send the token
    def query_current_user(cls, message):
        """Creates a query for the scores of the current user.

        Note: read related TODO

        Returns:
            An ndb.Query object bound to the current user. This can be used
            to filter for other properties or order by them.
        """
        #print message
        current_user = message
        return cls.get_by_id(current_user)


class Votes(ndb.Model):
    """
    Models users votes. All votes has a user as parent.
    Parent Entity key = User Facebook id
    """
    voteCastDate = ndb.DateTimeProperty(auto_now_add=True)
    vote = ndb.StringProperty(required=True)

    @property
    def timestamp(self):
        """Property to format a datetime object to string."""
        return self.joinDate.strftime(TIME_FORMAT_STRING)

    def to_message(self):
        """Turns a User Vote entity into a ProtoRPC object.

        This is necessary so the entity can be returned in an API request.

        Returns:
            An instance of VoteResponseMessage with the ID set to the datastore
            ID of the current entity, the user ID, the friend FB ID, and the casted vote.
        """
        return VoteResponseMessage(id=self.key.id(),
                                   vote=self.vote,
                                   status=1)

    def votes_to_message(self):
        """Turns a User Votes list into a ProtoRPC object.

        This is necessary so the entity can be returned in an API request.

        Returns:
            An instance of UserVotesResponseMessage with the actual user id and d a json formatted string
            containing all the user votes.
        """
        return VoteResponseMessage(id=self.key.id(),
                                   vote=self.vote)

    @classmethod
    def put_from_message(cls, message):
        """Gets the current user vote and inserts in the datastore. Where parent is the User Entity, id is the id
        of the user's friend that was voted.

        Args:
            message: A VoteRequestMessage instance to be inserted.

        Returns:
            The Vote entity that was inserted.
        """

        key = ndb.Key(Users, message.userID, Votes, message.friendID)
        ent = key.get()
        if ent is None:
            parent_instance = ndb.Key(Users, message.userID)
            ent = cls(parent=parent_instance,
                      id=int(message.friendID),
                      vote=message.vote)
        else:
            ent.id = message.friendID
            ent.vote = message.vote
        ent.put()
        return ent

    @classmethod
    #TODO: implement list paging.
    def query_current_user_votes(cls, message):
        """Creates a query for the votes of the current user.

        Returns:
            An ndb.Query object bound to the current user. This can be used
            to filter for other properties or order by them.
        """
        current_user = message.id
        ancestor_key = ndb.Key(Users, current_user)
        return cls.query(ancestor=ancestor_key).order(cls.key)


class TokensFB(ndb.Model):
    """
    Models facebook user's oauth tokens.
    Parent = Users
    Entity key = auto
    """
    updateDate = ndb.DateTimeProperty(auto_now=True)
    userID = ndb.IntegerProperty(required=True)
    shortToken = ndb.StringProperty(required=True)
    shortTokenExpiration = ndb.IntegerProperty(required=True)
    longToken = ndb.StringProperty()

    @property
    def timestamp(self):
        """Property to format a datetime object to string."""
        return self.creationDate.strftime(TIME_FORMAT_STRING)

    def to_message(self):
        """Turns the User entity into a ProtoRPC object.

        This is necessary so the entity can be returned in an API request.

        Returns:
            An instance of TokenResponseMessage with the ID set to the datastore
            ID of the current entity, the outcome simply the entity's outcome
            value and the played value equal to the string version of played
            from the property 'timestamp'.
        """
        return TokenResponseMessage(status='ok')

    @classmethod
    def put_from_message(cls, message):

        auth_data = json.loads(message.authResponse)
        user_id = int(auth_data['userID'])
        short_token = auth_data['accessToken']
        token_expiration = auth_data['expiresIn']

        parent_instance = ndb.Key(Users, user_id)
        token_user_key = TokensFB.query(TokensFB.userID == user_id, ancestor=parent_instance)
        ent = token_user_key.get()
        if ent is None:
            parent_instance = ndb.Key(Users,user_id)
            ent = cls(parent=parent_instance,
                      userID=int(user_id),
                      shortToken=short_token,
                      shortTokenExpiration=token_expiration)
        else:
            ent.shortToken = short_token
            ent.shortTokenExpiration = token_expiration
        ent.put()
        return ent









    """
    sample userData json string:

        {
        "id":"1147574594",
        "name":"Sam Carecho",
        "first_name":"Sam",
        "last_name":"Carecho",
        "link":"https:\/\/www.facebook.com\/sam.carecho",
        "bio":"\"Genesis takes place continually in an ocean of nirvana. We have a beautiful melding of a timeless nirvana giving birth to multiple genesis\"  Dr. Michio Kaku\n\nAttention: If you need to contact me and are not on my Facebook friends list, please send a message to digiwise\u0040gmail.com.",
        "gender":"male",
        "religion":"Buddhist - Soto Zen",
        "political":"Libertarianism",
        "email":"digiwise\u0040gmail.com",
        "timezone":-2,
        "locale":"en_US",
        "languages":[
            {
            "id":"104034306299811",
            "name":"Brazilian Portuguese"},
            {
            "id":"106059522759137",
            "name":"English"}
        ],
        "verified":true,
        "updated_time":"2013-12-17T19:40:57+0000",
        "username":"sam.carecho"
        }

    """

