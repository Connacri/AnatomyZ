enum AnatomyRole { professor, student }

extension AnatomyRoleLabel on AnatomyRole {
  String get labelFr => this == AnatomyRole.professor ? 'Professeur' : 'Étudiant';
}
