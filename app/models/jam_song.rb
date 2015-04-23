class JamSong < ActiveRecord::Base
  belongs_to :jam
  belongs_to :song

  validates :jam,
  uniqueness: {scope: :song},
    presence: true

  validates :song,
    presence: true
end
