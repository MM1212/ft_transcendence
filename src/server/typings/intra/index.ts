export namespace Intra {
  export enum Endpoints {
    Me = '/me',
  }

  export namespace Campus {
    export interface Data {
      id: number;
      name: string;
      time_zone: string;
      language: Language;
      users_count: number;
      vogsphere_id: number;
      country: string;
      address: string;
      zip: string;
      city: string;
      website?: string;
      facebook?: string;
      twitter?: string;
      active: boolean;
      public?: boolean;
      email_extension: string;
      default_hidden_phone: boolean;
    }

    export interface Enrollment {
      id: number;
      user_id: number;
      campus_id: number;
      is_primary: boolean;
      created_at: string;
      updated_at: string;
    }
  }

  export namespace Cursus {
    type Kind = 'main' | 'piscine' | 'pedago';
    export interface Data {
      id: number;
      created_at: string;
      name: string;
      slug: string;
      kind: Kind;
    }

    export interface Skill {
      id: number;
      name: string;
      level: number;
    }

    export interface Enrollment {
      id: number;
      begin_at: string;
      end_at: string | null;
      grade: string | null;
      level: number;
      skills: Skill[];
      cursus_id: number;
      has_coalition: boolean;
      user: Student.Truncated;
      cursus: Data;
    }
  }

  export namespace Patronning {
    export interface Patron {}
    export interface Patronned {
      id: number;
      user_id: number;
      godfather_id: number;
      ongoing: boolean;
      created_at: string;
      updated_at: string;
    }
  }

  export interface Language {
    id: number;
    name: string;
    identifier: string;
    created_at: string;
    updated_at: string;
  }

  export namespace Projects {
    export interface Data {
      id: number;
      name: string;
      slug: string;
      parent_id: number | null;
    }
    export interface FromStudent {
      id: number;
      occurrence: number;
      final_mark: number | null;
      status: string;
      'validated?': boolean;
      current_team_id: number | null;
      project: Data;
      cursus_ids: number[];
      marked_at: string | null;
      marked: boolean;
      retriable_at: string | null;
      created_at: string;
      updated_at: string;
    }
  }

  export namespace Achievements {
    export interface Achievement {
      id: number;
      name: string;
      description: string;
      tier: string;
      kind: string;
      visible: boolean;
      image: string;
      nbr_of_success: number;
      users_url: string;
    }
  }

  export namespace Student {
    export namespace Titles {
      export interface Title {
        id: number;
        name: string;
      }
      export interface FromStudent {
        id: number;
        user_id: number;
        title_id: number;
        selected: boolean;
        created_at: string;
        updated_at: string;
      }
    }
    export interface Expertise {
      id: number;
      expertise_id: number;
      interested: boolean;
      value: number;
      contact_me: boolean;
      created_at: string;
      user_id: number;
    }
    export interface ImageVersions {
      large: string;
      medium: string;
      small: string;
      micro: string;
    }

    export interface Image {
      link: string;
      versions: ImageVersions;
    }

    export interface Truncated {
      id: number;
      login: string;
      url: string;
      email: string;
      first_name: string;
      last_name: string;
      usual_full_name: string;
      usual_first_name: string;
      phone: string | null;
      displayname: string;
      kind: string;
      image: Image;
      'staff?': boolean;
      correction_point: number;
      pool_month: string;
      pool_year: string;
      location: string | null;
      wallet: number;
      anonymize_date: string;
      data_erasure_date: string | null;
      'alumni?': boolean;
      'active?': boolean;
    }

    export interface Language {
      id: number;
      language_id: number;
      user_id: number;
      position: number;
      created_at: string;
    }

    export interface Data extends Truncated {
      groups: unknown[];
      cursus_users: Cursus.Enrollment[];
      projects_users: Projects.FromStudent[];
      languages_users: Language[];
      achievements: Achievements.Achievement[];
      titles: Titles.Title[];
      titles_users: Titles.FromStudent[];
      partnerships: unknown[];
      patroned: Patronning.Patronned[];
      patroning: Patronning.Patron[];
      expertises_users: Expertise[];
      roles: unknown[];
      campus: Campus.Data[];
      campus_users: Campus.Enrollment[];
    }
  }
}
