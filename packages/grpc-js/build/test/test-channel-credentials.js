"use strict";
/*
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const fs = require("fs");
const util_1 = require("util");
const channel_credentials_1 = require("../src/channel-credentials");
const common_1 = require("./common");
class CallCredentialsMock {
    constructor(child) {
        this.child = null;
        this.generateMetadata = common_1.mockFunction;
        if (child) {
            this.child = child;
        }
    }
    compose(callCredentials) {
        return new CallCredentialsMock(callCredentials);
    }
    _equals(other) {
        if (!this.child) {
            return this === other;
        }
        else if (!other || !other.child) {
            return false;
        }
        else {
            return this.child._equals(other.child);
        }
    }
}
// tslint:disable-next-line:no-any
const readFile = util_1.promisify(fs.readFile);
// A promise which resolves to loaded files in the form { ca, key, cert }
const pFixtures = Promise.all(['ca.pem', 'server1.key', 'server1.pem'].map(file => readFile(`${__dirname}/fixtures/${file}`))).then(result => {
    return { ca: result[0], key: result[1], cert: result[2] };
});
describe('ChannelCredentials Implementation', () => {
    describe('createInsecure', () => {
        it('should return a ChannelCredentials object with no associated secure context', () => {
            const creds = common_1.assert2.noThrowAndReturn(() => channel_credentials_1.ChannelCredentials.createInsecure());
            assert.ok(!creds._getConnectionOptions());
        });
    });
    describe('createSsl', () => {
        it('should work when given no arguments', () => {
            const creds = common_1.assert2.noThrowAndReturn(() => channel_credentials_1.ChannelCredentials.createSsl());
            assert.ok(!!creds._getConnectionOptions());
        });
        it('should work with just a CA override', async () => {
            const { ca } = await pFixtures;
            const creds = common_1.assert2.noThrowAndReturn(() => channel_credentials_1.ChannelCredentials.createSsl(ca));
            assert.ok(!!creds._getConnectionOptions());
        });
        it('should work with just a private key and cert chain', async () => {
            const { key, cert } = await pFixtures;
            const creds = common_1.assert2.noThrowAndReturn(() => channel_credentials_1.ChannelCredentials.createSsl(null, key, cert));
            assert.ok(!!creds._getConnectionOptions());
        });
        it('should work with three parameters specified', async () => {
            const { ca, key, cert } = await pFixtures;
            const creds = common_1.assert2.noThrowAndReturn(() => channel_credentials_1.ChannelCredentials.createSsl(ca, key, cert));
            assert.ok(!!creds._getConnectionOptions());
        });
        it('should throw if just one of private key and cert chain are missing', async () => {
            const { ca, key, cert } = await pFixtures;
            assert.throws(() => channel_credentials_1.ChannelCredentials.createSsl(ca, key));
            assert.throws(() => channel_credentials_1.ChannelCredentials.createSsl(ca, key, null));
            assert.throws(() => channel_credentials_1.ChannelCredentials.createSsl(ca, null, cert));
            assert.throws(() => channel_credentials_1.ChannelCredentials.createSsl(null, key));
            assert.throws(() => channel_credentials_1.ChannelCredentials.createSsl(null, key, null));
            assert.throws(() => channel_credentials_1.ChannelCredentials.createSsl(null, null, cert));
        });
    });
    describe('compose', () => {
        it('should return a ChannelCredentials object', () => {
            const channelCreds = channel_credentials_1.ChannelCredentials.createSsl();
            const callCreds = new CallCredentialsMock();
            const composedChannelCreds = channelCreds.compose(callCreds);
            assert.strictEqual(composedChannelCreds._getCallCredentials(), callCreds);
        });
        it('should be chainable', () => {
            const callCreds1 = new CallCredentialsMock();
            const callCreds2 = new CallCredentialsMock();
            // Associate both call credentials with channelCreds
            const composedChannelCreds = channel_credentials_1.ChannelCredentials.createSsl()
                .compose(callCreds1)
                .compose(callCreds2);
            // Build a mock object that should be an identical copy
            const composedCallCreds = callCreds1.compose(callCreds2);
            assert.ok(composedCallCreds._equals(composedChannelCreds._getCallCredentials()));
        });
    });
});
//# sourceMappingURL=test-channel-credentials.js.map