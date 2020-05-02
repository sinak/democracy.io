import axios from "axios";
import { ContactCongressMember } from "./contact-congress-types";
import { Open } from "unzipper";
import yaml from "js-yaml";
import { Legislator } from "../models";

const defaultURL =
  "https://github.com/unitedstates/contact-congress/archive/master.zip";

// zip file is currently under 1mb, we can just parse the entire file instead of
// streams
export async function fetch(
  url = defaultURL
): Promise<ContactCongressMember[]> {
  const res = await axios.get<Buffer>(url, {
    responseType: "arraybuffer",
  });
  const dir = await Open.buffer(res.data);
  const memberFileBufferPromises = dir.files
    .filter((file) => /members\/.*\.yaml/.test(file.path))
    .map((file) => file.buffer());
  const memberFileBuffers = await Promise.all(memberFileBufferPromises);

  const memberFiles = memberFileBuffers.map((b) => {
    const fileString = b.toString();
    return yaml.safeLoad(fileString, { json: true });
  });

  return memberFiles;
}

/**
 * filter out the senators
 * contact congress data for representatives isn't updated.
 */
export function filterSenators(
  ccMembers: ContactCongressMember[],
  dioLegislators: Legislator[]
) {
  return ccMembers.filter((m) => {
    const dioLegislator = dioLegislators.find(
      (l) => l.bioguideId === m.bioguide
    );
    return dioLegislator?.currentTerm.chamber === "senate";
  });
}
