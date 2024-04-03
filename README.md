# OpenAPI Lambda Connector
The OpenAPI Lambda Connector allows you to import APIs that have an OpenAPI/Swagger Documentation into the Hasura Supergraph. It works by creating the Types and API Calls required in Typescript and wrapping those API calls in functions. These functions are can then be exposed as queries or mutations via the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). 

Functions that wrap GET requests are marked with `@readonly` annotation, and are exposed as GraphQL Queries by the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). All other request types are exposed as GraphQL Mutations.

## Important
This connector is under active development right now and is not stable. It has known limitations and might have undocumented issues. Please create an issue if you run into any problems.

## Build and Run
You can use the Open API Connector via Docker or via the bundled CLI.

### Using Docker
Clone the repository and run the following commands to build the Docker image that can then be used for code generation.
```
cd ndc-open-api-lambda

# build the docker image with the name `ndc-oas-lambda` and tag `latest`
docker build -t ndc-oas-lambda:latest .

# get command documentation/help
docker run --rm ndc-oas-lambda:latest update -h

# when running the code generation, the container will expect either of the following two things
# 1. The OpenAPI document is mounted at `/etc/connector/` as `swagger.json`. OR
# 2. The link to the OpenAPI document is provided via the env var `NDC_OAS_DOCUMENT_URI`
# Please note that mounting a directory at /etc/connector/ is required in both cases, since that is where the code is generated
# **** Examples ****
# run the code generation
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} ndc-oas-lambda:latest update
# with headers
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_HEADERS=${key1=value1&key2=value2&key3=value3...} ndc-oas-lambda:latest update
# with headers and baseUrl
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_HEADERS=${key1=value1&key2=value2&key3=value3...} -e NDC_OAS_BASE_URL=http://demoapi.com/ ndc-oas-lambda:latest update

# start the NodeJS Lambda Connector
docker run --rm -p 8080:8080 -v ./:/etc/connector ndc-oas-lambda:latest
```

### Using the CLI
You can install the OpenAPI Connector as a CLI on your system. Please ensure you have NPM and Node 20+ installed. You can install and run the CLI using the following commands
```
cd ndc-open-api-lambda

# install dependencies and then install the CLI
npm i
npm run install-bin

# print help for update command
ndc-oas-lamda update -h

# **** Examples ****
# run the update command to generate code
ndc-oas-lamda update --open-api ${link/path to open api swagger document}
# with headers
ndc-oas-lamda update --open-api ${link/path to open api swagger document} -H key1=value -H key2=value2 -H keyN=valueN
# with baseurl and headers
ndc-oas-lamda update --open-api ${link/path to open api swagger document} -H key1=value -H key2=value2 -H keyN=valueN -b http://localhost:8081

# start the NodeJS Lambda Connector
npm run watch
```
By default, both the CLI and the Docker container output logs in JSON fromat. To change that to a more human readable format during development, please set the env var `NDC_OAS_LAMBDA_PRETTY_LOGS=true`

## Supported Request Types
Request Type | Query | Path | Body | Headers
--- | --- | --- | --- | --- 
GET | y | y | NA | Not Tested
POST | y | y | y | Not Tested
DELETE | y | y | y | Not Tested
PUT | y | y | y | Not Tested
PATCH | y | y | y | Not Tested


## Known Limiations
- [Types not supported by the NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#unsupported-types) are not supported