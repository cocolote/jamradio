class UserSong < ActiveRecord::Base
  belongs_to :user
  belongs_to :song

  validates :user,
  uniqueness: {scope: :song},
    presence: true

  validates :song,
    presence: true
end
