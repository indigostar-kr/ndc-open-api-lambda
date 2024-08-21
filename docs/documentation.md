# Documentation

This connector is published as a Docker Image. The image name is `ghcr.io/hasura/ndc-open-api-lambda`. The Docker Image accepts the following environment variables that can be used to alter its functionality.

### Supported Environment Variables

| Environment Variable       | Description                                                                                                                                                                                                          | Required | Example Value                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| NDC_OAS_DOCUMENT_URI       | The URI to your Open API Document. If you're using a file instead of a HTTP link, please ensure that it is named `swagger.json` and is present in the root directory of the volume being mounted to `/etc/connector` | false    | https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml |
| NDC_OAS_BASE_URL           | The base URL of your API.                                                                                                                                                                                            | false    | http://my-awesome-webapp.com/v1/                                                                      |
| NDC_OAS_FILE_OVERWRITE     | A Boolean flag to allow previously generated files to be over-written. Defaults to `false`.                                                                                                                          | false    |                                                                                                       |
| HASURA_PLUGIN_LOG_LEVEL    | The log level. Possible values: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic`. Defaults to `info`                                                                                                      | false    | info                                                                                                  |
| NDC_OAS_LAMBDA_PRETTY_LOGS | A Boolean flag to print human readable logs instead of JSON. Defaults to `false`                                                                                                                                     | false    | true                                                                                                  |

### Saving User Changes

When re-introspecting the connector, user changes in `functions.ts` can be preserved by adding an `@save` JS Doc Tag to the documentation comment of a function. This will ensure that that function is not overwritten and the saved function will be added if missing in the newly generated `functions.ts`

Example

```
/**
 * Dummy function that mutates an API response
 * @save
 */
function mutateResponse(response: ApiResponseObject) {
  response.description = "This API does some work. I hope that's helpful";
}
```

### Usage without the DDN CLI

The Docker Image can be used without the DDN CLI as a codegen tool for the [NDC NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). Please see the Examples section on how to do that.

The Docker Container will output the generated files at `/etc/connector`. Please ensure that a volume mount is present at that directory while using the `docker run` command

> [!NOTE]
> The Docker Container uses the NDC Open API Lambda Connector CLI internally, so `-h` on any command will print the help for that command. Also, env vars can be substituted with CLI flags passed to the `docker run` command

### Examples

```
# get command documentation/help
docker run --rm ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update -h

# run the code generation (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update

# run the code generation (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update --open-api ${url to open API document}

# with baseUrl (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_BASE_URL=http://demoapi.com/ ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update

# with baseUrl (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update --open-api ${url to open API document} --base-url http://demoapi.com/
```

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

# **** START: Examples ****
# run the code generation
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} ndc-oas-lambda:latest update

# with baseUrl
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_BASE_URL=http://demoapi.com/ ndc-oas-lambda:latest update

# **** END: Examples ****

# start the NodeJS Lambda Connector
docker run --rm -p 8080:8080 -v ./:/etc/connector ndc-oas-lambda:latest
```

NOTE: You can also pass CLI flags with values to the Docker Container instead of environment variables

### Using the CLI

You can install the OpenAPI Connector as a CLI on your system. Please ensure you have NPM and Node 20+ installed. You can install and run the CLI using the following commands

```
cd ndc-open-api-lambda

# install dependencies and then install the CLI
npm i
npm run install-bin

# print help for update command
ndc-oas-lambda update -h

# **** Examples ****
# run the update command to generate code
ndc-oas-lambda update --open-api ${link/path to open api swagger document}
# with headers
ndc-oas-lambda update --open-api ${link/path to open api swagger document} -H key1=value -H key2=value2 -H keyN=valueN
# with baseurl and headers
ndc-oas-lambda update --open-api ${link/path to open api swagger document} -H key1=value -H key2=value2 -H keyN=valueN -b http://localhost:8081

# start the NodeJS Lambda Connector
npm run watch
```