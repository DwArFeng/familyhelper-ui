import {
  get, patch, post,
} from '@/util/http';

export function exists(key) {
  return get('clannad', `profile/${key}/exists/`, {});
}

export function inspect(key) {
  return get('clannad', `profile/${key}/`, {});
}

export function inspectDisp(key) {
  return get('clannad', `profile/${key}/disp`, {});
}

export function updateProfile(
  key, name, idNumber, idType, birthday, gender, bloodType, nationality, familyAddress,
  phoneNumber, emailAddress, employer, jobPosition, employerAddress, jobTitle, latestSchoolName,
  educationalLevel, educationalBackground, politicalStatus, maritalStatus, remark,
) {
  return patch('clannad', 'profile/update', {
    key: {
      string_id: key,
    },
    name,
    id_number: idNumber,
    id_type: idType,
    birthday,
    gender,
    blood_type: bloodType,
    nationality,
    family_address: familyAddress,
    phone_number: phoneNumber,
    email_address: emailAddress,
    employer,
    job_position: jobPosition,
    employer_address: employerAddress,
    job_title: jobTitle,
    latest_school_name: latestSchoolName,
    educational_level: educationalLevel,
    educational_background: educationalBackground,
    political_status: politicalStatus,
    marital_status: maritalStatus,
    remark,
  });
}

export function resetGuestPermission(guests) {
  return post('clannad', 'profile/reset-guest-permission', guests);
}
