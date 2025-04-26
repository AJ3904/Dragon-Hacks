from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo import errors

#Connection URI
uri = "mongodb+srv://adlijohan5:m3FVS05RCgzs1eIs@dragonhacks.ibr5by4.mongodb.net/?retryWrites=true&w=majority&appName=DragonHacks"

#Connect to MongoDB
client = MongoClient(uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("Connection failed:", e)
    exit(1)

#Select database
db = client["Database"]

#Create the GroupInformation collection
group_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "GroupName",
            "Users",
            "WalletBalance",
            "MonthlyDepositAmount",
            "GracePeriod",
            "PayDuration"
        ],
        "properties": {
            "GroupName": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "Users": {
                "bsonType": "array",
                "items": { "bsonType": "string" },
                "description": "must be an array of user IDs (strings)"
            },
            "WalletBalance": {
                "bsonType": "double",
                "description": "must be a double and is required"
            },
            "MonthlyDepositAmount": {
                "bsonType": "double",
                "description": "must be a double and is required"
            },
            "GracePeriod": {
                "bsonType": "int",
                "description": "must be an integer (days) and is required"
            },
            "PayDuration": {
                "bsonType": "int",
                "description": "must be an integer (months) and is required"
            },
            "MinimumCreditScore": {
                "bsonType": ["int", "null"],
                "description": "can be an integer or null"
            }
        }
    }
}

try:
    db.create_collection("GroupInformation", validator=group_validator)
    print("‘GroupInformation’ collection created with schema validation.")
except errors.CollectionInvalid:
    print("Collection ‘GroupInformation’ already exists. Skipping creation.")
except Exception as e:
    print("Error creating GroupInformation collection:", e)
    exit(1)

#Create the UserInformation collection
user_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "Auth0Id",
            "Username",
            "WalletBalance",
            "Groups",
            "TrustScore",
            "FirstName",
            "LastName",
            "DOB"
        ],
        "properties": {
            "Auth0Id": {
                "bsonType": "string",
                "description": "the Auth0 user ID (e.g. 'auth0|123…') – required and unique"
            },
            "Username": {
                "bsonType": "string",
                "description": "the user’s chosen display name – required"
            },
            "FirstName": {
                "bsonType": "string",
                "description": "the user’s first name – required"
            },
            "LastName": {
                "bsonType": "string",
                "description": "the user’s last name – required"
            },
            "DOB": {
                "bsonType": "date",
                "description": "the user’s date of birth – required"
            },
            "WalletBalance": {
                "bsonType": ["double", "int", "decimal"],
                "description": "the user’s current wallet balance – required"
            },
            "Groups": {
                "bsonType": "array",
                "items": { "bsonType": "string" },
                "description": "list of group IDs or names this user belongs to – required"
            },
            "TrustScore": {
                "bsonType": ["double", "int"],
                "description": "a computed trust score or rating for the user – required"
            },
            "PhoneNumber": {
                "bsonType": ["string", "null"],
                "description": "the user’s phone number – optional"
            }
        }
    }
}

try:
    db.create_collection("UserInformation", validator=user_validator)
    print("‘UserInformation’ collection created with schema validation.")
except errors.CollectionInvalid:
    print("Collection ‘UserInformation’ already exists. Skipping creation.")
except Exception as e:
    print("Error creating UserInformation collection:", e)
    exit(1)

#Check if Auth0Id is unique
try:
    db.UserInformation.create_index("Auth0Id", unique=True)
    print("Ensured ‘Auth0Id’ is unique via an index on UserInformation.")
except Exception as e:
    print("Error creating index on UserInformation.Auth0Id:", e)
    exit(1)