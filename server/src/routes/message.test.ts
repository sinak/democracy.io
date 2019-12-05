/**
 * Tests for all /api/{version}/location endpoints.
 */
import supertest from "supertest";
import { mocked } from "ts-jest/utils";
import app from "./../app";
import * as PotcAPI from "./../services/PotcAPI";
import { Message } from "../models";
import { axiosResponseFixture } from "../fixtures";

jest.mock("./../services/PotcAPI");
const mockedPotcAPI = mocked(PotcAPI);

describe("/api/message", function() {
  test("sends the message to PotC API", async () => {
    let message: Message = {
      bioguideId: "bioguideId",
      campaign: {
        orgName: "orgName",
        orgURL: "orgURL",
        uuid: "uuid"
      },
      message: "message",
      sender: {
        email: "email",
        firstName: "firstName",
        lastName: "lastName",
        namePrefix: "namePrefix",
        parenPhone: "parenPhone",
        phone: "phone"
      },
      senderAddress: {
        city: "city",
        county: "county",
        district: 0,
        stateFull: "stateFull",
        statePostalAbbrev: "statePostalAbbrev",
        streetAddress: "streetAddress",
        streetAddress2: "streetAddress2",
        zip4: "zip4",
        zip5: "zip5",
        zipPlus4: "zipPlus4"
      },
      subject: "subject",
      topic: "topic"
    };

    const mockedFillOutForm = mockedPotcAPI.fillOutForm.mockResolvedValueOnce(
      axiosResponseFixture<PotcAPI.FillOutFormResponse>({
        data: {
          status: "success"
        }
      })
    );

    await supertest(app)
      .post("/api/message")
      .send([message])
      .expect(200);

    const expectedCalledWith: Partial<PotcAPI.FillOutFormRequest> = {
      bio_id: message.bioguideId,
      // campaign_tag: "", this is randomly generated
      fields: {
        $NAME_PREFIX: message.sender.namePrefix,
        $NAME_FIRST: message.sender.firstName,
        $NAME_LAST: message.sender.lastName,
        $NAME_FULL: message.sender.firstName + message.sender.lastName,
        $PHONE: message.sender.phone,
        $PHONE_PARENTHESES: message.sender.parenPhone,
        $EMAIL: message.sender.email,
        $ADDRESS_STREET: message.senderAddress.streetAddress,
        $ADDRESS_STREET_2: null, // This is never set
        $ADDRESS_CITY: message.senderAddress.city,
        $ADDRESS_STATE_POSTAL_ABBREV: message.senderAddress.statePostalAbbrev,
        $ADDRESS_STATE_FULL: message.senderAddress.stateFull,
        $ADDRESS_COUNTY: message.senderAddress.county,
        $ADDRESS_ZIP5: message.senderAddress.zip5,
        $ADDRESS_ZIP4: message.senderAddress.zip4,
        $ADDRESS_ZIP_PLUS_4: message.senderAddress.zipPlus4,
        $TOPIC: message.topic,
        $SUBJECT: message.subject,
        $MESSAGE: message.message,
        $CAMPAIGN_UUID: message.campaign.uuid,
        $ORG_URL: message.campaign.orgURL,
        $ORG_NAME: message.campaign.orgName
      }
    };

    const arg = mockedFillOutForm.mock.calls[0][0];
    expect(arg).toMatchObject(expectedCalledWith);
  });
});
