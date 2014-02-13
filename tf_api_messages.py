#!/usr/bin/python


"""ProtoRPC message class definitions for TrustFerret API."""


from protorpc import messages


class UserRequestMessage(messages.Message):
    """ProtoRPC message definition to represent a user to be inserted."""
    userData = messages.StringField(1, required=True)


class GetUserRequestMessage(messages.Message):
    """ProtoRPC message definition to represent a user to be retrieved."""
    userID = messages.IntegerField(1, required=True)


class UserResponseMessage(messages.Message):
    """ProtoRPC message definition to represent a user that is stored."""
    id = messages.IntegerField(1, required=True)
    joinDate = messages.StringField(2, required=True)
    userName = messages.StringField(3, required=True)
    userData = messages.StringField(4)


class VoteRequestMessage(messages.Message):
    """ProtoRPC message definition to represent a user vote to be inserted."""
    userID = messages.IntegerField(1, required=True)
    friendID = messages.IntegerField(2, required=True)
    vote = messages.StringField(3, required=True)


class VoteResponseMessage(messages.Message):
    """ProtoRPC message definition to represent a response to a vote insertion or update."""
    id = messages.IntegerField(1, required=True)
    vote = messages.StringField(2, required=True)
    status = messages.IntegerField(3)


class UserVotesRequestMessage(messages.Message):
    """ProtoRPC message definition to represent a list of votes from the current user."""
    userID = messages.IntegerField(1, required=True)
    limit = messages.IntegerField(2, required=True)


class VotesListResponse(messages.Message):
    """ProtoRPC message definition to represent a list of stored votes."""
    votes = messages.MessageField(VoteResponseMessage, 1, repeated=True)


class TokenRequestMessage(messages.Message):
    """ProtoRPC message definition to represent FB user tokens."""
    authResponse = messages.StringField(1, required=True)


class TokenResponseMessage(messages.Message):
    """ProtoRPC message definition to represent FB user tokens."""
    status = messages.StringField(1, required=True)

